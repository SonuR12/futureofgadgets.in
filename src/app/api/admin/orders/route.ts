import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'admin' && session.user?.email !== 'admin@electronic.com')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        userId: true,
        total: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        billUrl: true,
        paymentMethod: true,
        deliveryDate: true,
        items: true,
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    })

    return NextResponse.json({ orders }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user?.role !== 'admin' && session.user?.email !== 'admin@electronic.com')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { orderId, status, billUrl } = await request.json()
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (billUrl) updateData.billUrl = billUrl
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      select: {
        id: true,
        userId: true,
        total: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        billUrl: true,
        paymentMethod: true,
        deliveryDate: true,
        items: true,
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        }
      }
    })
    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}