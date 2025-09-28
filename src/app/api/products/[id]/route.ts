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
        description: data.description,
        frontImage: data.frontImage,
        images: data.images || [],
        price: data.price,
        stock: data.quantity || data.stock || 0,
        quantity: data.quantity || data.stock || 0,
        brand: data.brand,
        status: data.status || 'active',
        sku: data.sku
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Get product details before deletion
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete from database
    await prisma.product.delete({
      where: { id }
    });

    // Delete product directory
    if (product.name) {
      const { rmdir } = await import('fs/promises');
      const { join } = await import('path');
      const { existsSync } = await import('fs');
      
      const safeDirName = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const productDir = join(process.cwd(), 'public/uploads/productadd', safeDirName);
      
      if (existsSync(productDir)) {
        await rmdir(productDir, { recursive: true });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}