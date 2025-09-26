import { NextResponse } from "next/server"
import { searchProductsSuggestions } from "@/lib/mock-db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""
  const results = searchProductsSuggestions(q, 8)
  return NextResponse.json({ suggestions: results })
}
