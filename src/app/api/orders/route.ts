import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, getOrderNotificationTemplate, getOrderConfirmationTemplate } from "@/lib/email"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    if (!session.user?.email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }
    
    // Find user by email
    let user = await prisma.user.findFirst({
      where: { email: session.user.email }
    })
    
    // If user doesn't exist, create one
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          role: session.user.role || 'user',
          provider: 'google'
        }
      })
    }
    
    // Use raw MongoDB query to avoid Prisma date parsing issues
    const orders = await prisma.$runCommandRaw({
      find: 'Order',
      filter: { userId: { $oid: user.id } },
      sort: { createdAt: -1 }
    })
    
    // Transform the raw data
    const transformedOrders = (orders as any).cursor.firstBatch.map((order: any) => ({
      id: order._id.$oid,
      userId: order.userId.$oid,
      items: order.items,
      total: order.total,
      status: order.status,
      address: order.address,
      paymentMethod: order.paymentMethod,
      deliveryDate: order.deliveryDate?.$date,
      billUrl: order.billUrl,
      createdAt: order.createdAt.$date,
      updatedAt: typeof order.updatedAt === 'string' ? order.updatedAt : order.updatedAt.$date
    }))
    
    console.log('Found orders:', transformedOrders.length, 'for user:', user.id)
    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    if (!session.user?.email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }
    
    // Find or create user in database
    let user = await prisma.user.findFirst({
      where: { email: session.user.email }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          role: session.user.role || 'user',
          provider: 'google'
        }
      })
    }
    
    console.log('Creating order for user:', user.id)
    
    const body = await request.json()
    const { items, address, paymentMethod, deliveryDate, razorpayPaymentId, razorpayOrderId } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    const orderItems = []
    let total = 0

    // First, validate stock for all items
    for (const it of items) {
      const product = await prisma.product.findUnique({ where: { id: it.productId } })
      if (!product) {
        return NextResponse.json({ error: `Product not found` }, { status: 400 })
      }
      
      const requestedQty = Math.max(1, Math.floor(it.qty || 1))
      
      // Check if enough stock is available
      if (product.quantity < requestedQty) {
        return NextResponse.json({ 
          error: `"${product.name}" is out of stock. Only ${product.quantity} available.` 
        }, { status: 400 })
      }
    }

    // If all items have sufficient stock, proceed with order
    for (const it of items) {
      const product = await prisma.product.findUnique({ where: { id: it.productId } })
      if (!product) return NextResponse.json({ error: `Product not found` }, { status: 400 })
      
      const orderItem: any = {
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: Math.max(1, Math.floor(it.qty || 1))
      }
      if (it.color) orderItem.color = it.color
      orderItems.push(orderItem)
      total += orderItem.price * orderItem.qty
      
      // Update stock
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          quantity: Math.max(0, product.quantity - orderItem.qty),
          stock: Math.max(0, product.stock - orderItem.qty)
        } as any
      })
    }

    let order
    try {
      order = await prisma.order.create({
        data: {
          userId: user.id,
          items: orderItems as any,
          total,
          status: paymentMethod === 'cod' ? "pending" : "paid",
          address,
          paymentMethod,
          deliveryDate: new Date(deliveryDate)
        } as any
      })
    } catch (error) {
      // Restock items if order creation fails
      for (const it of items) {
        const product = await prisma.product.findUnique({ where: { id: it.productId } })
        if (product) {
          await prisma.product.update({
            where: { id: product.id },
            data: { 
              quantity: product.quantity + Math.max(1, Math.floor(it.qty || 1)),
              stock: product.stock + Math.max(1, Math.floor(it.qty || 1))
            } as any
          })
        }
      }
      throw error
    }

    // Return success immediately
    const response = NextResponse.json({ order }, { status: 201 })

    // Send emails asynchronously without blocking
    setImmediate(async () => {
      try {
        console.log('Order items for email:', JSON.stringify(orderItems, null, 2))
        
        const adminEmail = process.env.PROTECTED_ADMIN_EMAIL_ID || process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL_ID
        if (adminEmail) {
          const emailHtml = getOrderNotificationTemplate({
            orderId: order.id,
            customerName: address.fullName,
            customerPhone: address.phone,
            customerEmail: body.userEmail,
            items: orderItems,
            total,
            address: `${address.line1}, ${address.line2 ? address.line2 + ', ' : ''}${address.city}, ${address.state} - ${address.zip}`,
            paymentMethod
          })
          
          await sendEmail(adminEmail, `New Order #${order.id.slice(-8)}`, emailHtml)
        }

        if (user.email) {
          const confirmationHtml = getOrderConfirmationTemplate({
            orderId: order.id,
            customerName: address.fullName,
            items: orderItems,
            total,
            address: `${address.line1}, ${address.line2 ? address.line2 + ', ' : ''}${address.city}, ${address.state} - ${address.zip}`,
            paymentMethod,
            deliveryDate
          })
          
          await sendEmail(user.email, `Order Confirmation #${order.id.slice(-8)}`, confirmationHtml)
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError)
      }
    })

    return response
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: "Failed to create order", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
