import { NextResponse } from "next/server"
import { getUsers } from "@/lib/mock-db"

export async function GET() {
  return NextResponse.json({ users: getUsers() })
}
