import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.category || !data.price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if slug already exists
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Product with this name already exists,' }, { status: 409 });
    }
    
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description?.replace(/\./g, '\n') || '',
        frontImage: data.frontImage || '',
        images: Array.isArray(data.images) ? data.images : [],
        price: Number(data.price),
        mrp: Number(data.mrp) || Number(data.price),
        stock: Number(data.quantity) || 0,
        quantity: Number(data.quantity) || 0,
        brand: data.brand || '',
        screenSize: data.screenSize || '',
        hardDiskSize: data.hardDiskSize || '',
        cpuModel: data.cpuModel || '',
        ramMemory: data.ramMemory || '',
        operatingSystem: data.operatingSystem || '',
        graphics: data.graphics || '',
        offers: data.offers || '',
        status: data.status || 'active',
        sku: data.sku || `SKU-${Date.now()}`
      } as any
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

