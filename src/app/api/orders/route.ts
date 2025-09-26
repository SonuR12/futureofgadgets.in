import { NextResponse } from "next/server"
import { addOrder, getOrders, findProductById } from "@/lib/mock-db"
import type { Address, Order, OrderItem, PaymentMethod } from "@/lib/types"

export async function GET() {
  return NextResponse.json({ orders: getOrders() })
}

export async function POST(request: Request) {
  const body = await request.json()
  const {
    items,
    address,
    paymentMethod,
    deliveryDate,
    userEmail,
  }: {
    items: { productId: string; qty: number }[]
    address: Address
    paymentMethod: PaymentMethod
    deliveryDate: string
    userEmail?: string
  } = body

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 })
  }

  const orderItems: OrderItem[] = []
  let total = 0

  for (const it of items) {
    const prod = findProductById(it.productId)
    if (!prod) return NextResponse.json({ error: `Invalid product ${it.productId}` }, { status: 400 })
    const line: OrderItem = {
      productId: prod.id,
      title: prod.title,
      price: prod.price,
      qty: Math.max(1, Math.floor(it.qty || 1)),
      image: prod.image,
    }
    orderItems.push(line)
    total += line.price * line.qty
  }

  const newOrder: Order = {
    id: `o_${Date.now()}`,
    createdAt: new Date().toISOString(),
    items: orderItems,
    total,
    status: paymentMethod === "cod" ? "pending" : "paid",
    address,
    paymentMethod,
    deliveryDate,
    userEmail,
  }

  addOrder(newOrder)
  return NextResponse.json({ order: newOrder }, { status: 201 })
}
