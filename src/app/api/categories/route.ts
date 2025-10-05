import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ categories: categories.map(c => c.name) });
  } catch (error) {
    return NextResponse.json({ categories: ["Laptops", "Desktops", "Monitors", "Keyboards", "Headphones"] });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }
    
    await prisma.category.create({
      data: { name: name.trim() }
    });
    
    return NextResponse.json({ message: "Category added successfully" });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Category already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to add category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { name } = await req.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }
    
    await prisma.category.delete({
      where: { name: name.trim() }
    });
    
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}