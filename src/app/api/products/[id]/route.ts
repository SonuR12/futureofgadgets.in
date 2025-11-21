// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();

    // validate minimal fields if you want
    if (!body.name || !body.category || typeof body.price === "undefined") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } as any });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // calculate stock/quantity if ramOptions provided
    let calculatedQty = Number(body.quantity) || 0;
    if (body.ramOptions && Array.isArray(body.ramOptions) && body.ramOptions.length > 0) {
      calculatedQty = body.ramOptions.reduce((sum: number, opt: any) => sum + (opt.quantity || 0), 0);
    }

    const updated = await prisma.product.update({
      where: { id } as any,
      data: {
        name: body.name,
        slug: body.slug,
        category: body.category,
        description: body.description ?? "",
        frontImage: body.frontImage ?? "",
        images: Array.isArray(body.images) ? body.images : [],
        price: Number(body.price),
        mrp: Number(body.mrp) || Number(body.price),
        stock: calculatedQty,
        quantity: calculatedQty,
        brand: body.brand ?? "",
        modelName: body.modelName ?? "",
        warranty: body.warranty ?? "",
        warrantyType: body.warrantyType ?? "",
        screenSize: body.screenSize ?? "",
        cpuModel: body.cpuModel ?? "",
        operatingSystem: body.operatingSystem ?? "",
        graphics: body.graphics ?? "",
        color: body.color ?? "",
        boxContents: body.boxContents ?? "",
        status: body.status ?? "active",
        sku: body.sku ?? existing.sku,
        rating: Number(body.rating) || 0,
        ratingCount: parseFloat(body.ratingCount) || 0,
        ramOptions: body.ramOptions ?? existing.ramOptions,
        storageOptions: body.storageOptions ?? existing.storageOptions,
        warrantyOptions: body.warrantyOptions ?? existing.warrantyOptions,
      } as any,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update product", details: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const existing = await prisma.product.findUnique({ where: { id } as any });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await prisma.product.delete({ where: { id } as any });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete product", details: err?.message ?? String(err) }, { status: 500 });
  }
}
