import { NextResponse } from "next/server"
import { getProducts } from "@/lib/mock-db"

export async function GET() {
  return NextResponse.json({ products: getProducts() })
}
