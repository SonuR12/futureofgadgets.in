import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: orderId } = await context.params

  try {
    const user = await prisma.user.findFirst({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { reason } = await req.json()

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', cancelReason: reason || null, updatedAt: new Date() }
    })

    // Restock items
    const items = (order as any).items || []
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: { increment: item.qty },
          stock: { increment: item.qty }
        }
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Cancel order error:', error)
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}
