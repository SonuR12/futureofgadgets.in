// src/app/api/auth/check-user/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findFirst({
      where: {
        email,
        provider: 'credentials'
      }
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error in check-user route:', error)
    return NextResponse.json({ exists: false })
  }
}
