import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: { image: true, imageType: true }
    });
    
    if (!product || !product.image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    return new NextResponse(product.image, {
      headers: {
        'Content-Type': product.imageType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}