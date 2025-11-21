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
    if (!data.name || !data.category || typeof data.price === 'undefined') {
      return NextResponse.json({ 
        error: 'Missing required fields: name, category, and price are required' 
      }, { status: 400 });
    }

    // Validate price is a valid number
    const price = Number(data.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json({ 
        error: 'Price must be a valid positive number' 
      }, { status: 400 });
    }

    // Check if slug already exists
    if (data.slug) {
      const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return NextResponse.json({ 
          error: 'Product with this name already exists' 
        }, { status: 409 });
      }
    }
    
    // Calculate quantity from RAM options if provided
    let calculatedQty = Number(data.quantity) || 0;
    if (data.ramOptions && Array.isArray(data.ramOptions) && data.ramOptions.length > 0) {
      calculatedQty = data.ramOptions.reduce((sum: number, opt: any) => sum + (Number(opt.quantity) || 0), 0);
    }
    
    // Prepare product data
    const productData = {
      name: String(data.name).trim(),
      slug: String(data.slug || '').trim(),
      category: String(data.category).trim(),
      description: String(data.description || '').trim(),
      frontImage: String(data.frontImage || '').trim(),
      images: Array.isArray(data.images) ? data.images.filter((img: any) => img && typeof img === 'string') : [],
      price: price,
      mrp: Number(data.mrp) || price,
      stock: calculatedQty,
      quantity: calculatedQty,
      brand: String(data.brand || '').trim(),
      modelName: String(data.modelName || '').trim(),
      warranty: String(data.warranty || '').trim(),
      warrantyType: String(data.warrantyType || '').trim(),
      screenSize: String(data.screenSize || '').trim(),
      cpuModel: String(data.cpuModel || '').trim(),
      operatingSystem: String(data.operatingSystem || '').trim(),
      graphics: String(data.graphics || '').trim(),
      color: String(data.color || '').trim(),
      boxContents: String(data.boxContents || '').trim(),
      status: String(data.status || 'active').trim(),
      sku: String(data.sku || `SKU-${Date.now()}`).trim(),
      rating: Number(data.rating) || 0,
      ratingCount: parseFloat(data.ratingCount) || 0,
      ramOptions: data.ramOptions || [],
      storageOptions: data.storageOptions || [],
      warrantyOptions: data.warrantyOptions || []
    };
    
    console.log('Creating product with data:', JSON.stringify(productData, null, 2));
    
    const product = await prisma.product.create({
      data: productData as any
    });
    
    console.log('Product created successfully:', product.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'Product with this slug already exists' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create product',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: 'Unknown error occurred'
    }, { status: 500 });
  }
}

