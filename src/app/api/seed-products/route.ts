import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const sampleProducts = [
  {
    name: "MacBook Pro 14-inch M3 Pro",
    slug: "macbook-pro-14-m3-pro",
    price: 199900,
    mrp: 219900,
    category: "Laptops",
    brand: "Apple",
    description: "Apple MacBook Pro 14-inch with M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for professionals and creators.",
    frontImage: "/category/pro_laptop.jpg",
    images: ["/category/pro_laptop.jpg"],
    stock: 5,
    quantity: 5,
    sku: "MBP-14-M3P",
    modelName: "MacBook Pro 14",
    warranty: "1 Year",
    warrantyType: "International",
    screenSize: "14.2-inch Liquid Retina XDR",
    cpuModel: "Apple M3 Pro",
    operatingSystem: "macOS Sonoma",
    graphics: "Integrated GPU",
    color: "Space Gray, Silver",
    boxContents: "MacBook Pro\nUSB-C to MagSafe 3 Cable\n67W USB-C Power Adapter\nDocumentation"
  },
  {
    name: "ASUS ROG Strix G15 Gaming Laptop",
    slug: "asus-rog-strix-g15-gaming",
    price: 89999,
    mrp: 109999,
    category: "Laptops",
    brand: "ASUS",
    description: "High-performance gaming laptop with AMD Ryzen 7, RTX 4060, 16GB RAM, 512GB SSD.",
    frontImage: "/category/best-gaming-laptop.jpg",
    images: ["/category/best-gaming-laptop.jpg"],
    stock: 8,
    quantity: 8,
    sku: "ROG-G15-4060",
    modelName: "ROG Strix G15",
    warranty: "2 Years",
    warrantyType: "Onsite",
    screenSize: "15.6-inch FHD 144Hz",
    cpuModel: "AMD Ryzen 7 7735HS",
    operatingSystem: "Windows 11 Home",
    graphics: "NVIDIA RTX 4060 8GB",
    color: "Eclipse Gray",
    boxContents: "Laptop\nPower Adapter\nUser Manual\nWarranty Card"
  },
  {
    name: "HP Pavilion 15 Business Laptop",
    slug: "hp-pavilion-15-business",
    price: 54999,
    mrp: 64999,
    category: "Laptops",
    brand: "HP",
    description: "Reliable business laptop with Intel Core i5, 8GB RAM, 512GB SSD. Perfect for office work.",
    frontImage: "/category/office_laptop.jpg",
    images: ["/category/office_laptop.jpg"],
    stock: 12,
    quantity: 12,
    sku: "HP-PAV-15-I5",
    modelName: "Pavilion 15",
    warranty: "1 Year",
    warrantyType: "Onsite",
    screenSize: "15.6-inch FHD",
    cpuModel: "Intel Core i5-1235U",
    operatingSystem: "Windows 11 Home",
    graphics: "Intel Iris Xe",
    color: "Natural Silver",
    boxContents: "Laptop\n65W Power Adapter\nDocumentation"
  },
  {
    name: "Dell Precision 5570 Workstation",
    slug: "dell-precision-5570-workstation",
    price: 149999,
    mrp: 169999,
    category: "Laptops",
    brand: "Dell",
    description: "Professional workstation laptop with Intel Core i7, 32GB RAM, 1TB SSD, NVIDIA RTX A2000.",
    frontImage: "/category/Precision.jpg",
    images: ["/category/Precision.jpg"],
    stock: 3,
    quantity: 3,
    sku: "DELL-PREC-5570",
    modelName: "Precision 5570",
    warranty: "3 Years",
    warrantyType: "ProSupport",
    screenSize: "15.6-inch 4K OLED",
    cpuModel: "Intel Core i7-12700H",
    operatingSystem: "Windows 11 Pro",
    graphics: "NVIDIA RTX A2000 4GB",
    color: "Titan Gray",
    boxContents: "Workstation\n130W Power Adapter\nDocumentation\nProSupport Card"
  },
  {
    name: "Alienware m15 R7 Gaming Beast",
    slug: "alienware-m15-r7-gaming",
    price: 179999,
    mrp: 199999,
    category: "Laptops",
    brand: "Alienware",
    description: "Ultimate gaming laptop with Intel Core i9, RTX 4070, 32GB RAM, 1TB SSD, 240Hz display.",
    frontImage: "/category/alienware.jpeg",
    images: ["/category/alienware.jpeg"],
    stock: 2,
    quantity: 2,
    sku: "AW-M15-R7",
    modelName: "Alienware m15 R7",
    warranty: "2 Years",
    warrantyType: "Premium Support",
    screenSize: "15.6-inch FHD 240Hz",
    cpuModel: "Intel Core i9-12900H",
    operatingSystem: "Windows 11 Home",
    graphics: "NVIDIA RTX 4070 8GB",
    color: "Lunar Light, Dark Side of the Moon",
    boxContents: "Gaming Laptop\n240W Power Adapter\nAlienware Mouse Pad\nDocumentation"
  }
];

export async function POST() {
  try {
    const results = [];
    
    for (const productData of sampleProducts) {
      const existing = await prisma.product.findUnique({
        where: { slug: productData.slug }
      });
      
      if (!existing) {
        const product = await prisma.product.create({
          data: productData
        });
        results.push(product);
      }
    }
    
    return NextResponse.json({ 
      message: `Added ${results.length} new products`,
      products: results.length 
    });
  } catch (error) {
    console.error('Error adding products:', error);
    return NextResponse.json({ error: 'Failed to add products' }, { status: 500 });
  }
}