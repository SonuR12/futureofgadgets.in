import { NextResponse } from "next/server"
import { products } from "@/lib/data/products"

type Product = {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  status: "active" | "draft" | "archived"
  category: string
  image: string
  updatedAt: string
}

export async function GET() {
  return NextResponse.json(products, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
