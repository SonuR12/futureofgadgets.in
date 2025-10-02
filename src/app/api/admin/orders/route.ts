import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "admin" && session.user?.email !== "admin@electronic.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Use raw MongoDB query to avoid DateTime parsing issues
    const result = await prisma.$runCommandRaw({
      aggregate: 'Order',
      pipeline: [
        {
          $lookup: {
            from: 'User',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            items: 1,
            total: 1,
            status: 1,
            address: 1,
            paymentMethod: 1,
            deliveryDate: 1,
            billUrl: 1,
            createdAt: 1,
            updatedAt: 1,
            'user.id': '$user._id',
            'user.name': '$user.name',
            'user.email': '$user.email',
            'user.phone': '$user.phone',
            'user.image': '$user.image'
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ],
      cursor: {}
    })
    
    // Transform the result to match expected format
    const formattedOrders = ((result as any).cursor?.firstBatch || []).map((order: any) => ({
      id: order._id.$oid || order._id,
      userId: order.userId.$oid || order.userId,
      items: order.items,
      total: order.total,
      status: order.status,
      address: order.address,
      paymentMethod: order.paymentMethod,
      deliveryDate: order.deliveryDate.$date || order.deliveryDate,
      billUrl: order.billUrl,
      createdAt: order.createdAt.$date || order.createdAt,
      updatedAt: order.updatedAt.$date || order.updatedAt,
      user: {
        id: order.user.id.$oid || order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        image: order.user.image
      }
    }))
    
    return NextResponse.json({ orders: formattedOrders })
  } catch (error: any) {
    console.error('Admin orders fetch error:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch orders",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== "admin" && session.user?.email !== "admin@electronic.com")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { orderId, status, billUrl } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Handle billUrl with raw MongoDB update to bypass Prisma schema issues
    if (billUrl !== undefined) {
      await prisma.$runCommandRaw({
        update: 'Order',
        updates: [{
          q: { _id: { $oid: orderId } },
          u: billUrl === null 
            ? { $unset: { billUrl: "" }, $set: { updatedAt: new Date() } }
            : { $set: { billUrl: billUrl, updatedAt: new Date() } }
        }]
      })
    }
    
    // Handle status update with regular Prisma
    if (status) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: status, updatedAt: new Date() }
      })
    }

    // Use raw MongoDB query to get the updated order
    const orderResult = await prisma.$runCommandRaw({
      find: 'Order',
      filter: { _id: { $oid: orderId } },
      limit: 1
    })
    
    if (!(orderResult as any).cursor?.firstBatch?.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    const orderData = (orderResult as any).cursor.firstBatch[0]
    
    // Get user data
    const userResult = await prisma.$runCommandRaw({
      find: 'User',
      filter: { _id: orderData.userId },
      limit: 1
    })
    
    const userData = (userResult as any).cursor.firstBatch[0]
    
    const order = {
      id: orderData._id.$oid || orderData._id,
      userId: orderData.userId.$oid || orderData.userId,
      items: orderData.items,
      total: orderData.total,
      status: orderData.status,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      deliveryDate: orderData.deliveryDate.$date || orderData.deliveryDate,
      billUrl: orderData.billUrl,
      createdAt: orderData.createdAt.$date || orderData.createdAt,
      updatedAt: orderData.updatedAt.$date || orderData.updatedAt,
      user: {
        id: userData._id.$oid || userData._id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        image: userData.image
      }
    }
    
    // Add billUrl to response if it was updated
    const orderWithBill = billUrl !== undefined ? { ...order, billUrl } : order

    return NextResponse.json({ order: orderWithBill })
  } catch (error: any) {
    console.error('Order update error:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to update order",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}