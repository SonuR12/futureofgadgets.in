import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description || '',
        frontImage: data.frontImage || '',
        images: data.images || [],
        price: Number(data.price),
        mrp: Number(data.mrp) || Number(data.price),
        stock: Number(data.quantity) || Number(data.stock) || 0,
        quantity: Number(data.quantity) || Number(data.stock) || 0,
        brand: data.brand || '',
        screenSize: data.screenSize || '',
        hardDiskSize: data.hardDiskSize || '',
        cpuModel: data.cpuModel || '',
        ramMemory: data.ramMemory || '',
        operatingSystem: data.operatingSystem || '',
        graphics: data.graphics || '',
        offers: data.offers || '',
        color: data.color || '',
        status: data.status || 'active',
        sku: data.sku || ''
      } as any
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { quantity } = await req.json();
    
    const currentProduct = await prisma.product.findUnique({ where: { id } });
    const wasOutOfStock = currentProduct && currentProduct.quantity === 0;
    const isRestocking = wasOutOfStock && Number(quantity) > 0;
    
    const product = await prisma.product.update({
      where: { id },
      data: { 
        quantity: Number(quantity),
        stock: Number(quantity),
        ...(isRestocking && { lastRestockedAt: new Date() })
      } as any
    });
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Stock update error:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}