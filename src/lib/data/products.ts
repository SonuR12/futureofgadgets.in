import type { Product } from "@/lib/types"

export const CATEGORIES = [
  "Show All",
  "Laptops",
  "Laptop Accessories",
  "Chargers", 
  "Keyboards",
  "Mouse",
  "Monitors",
] as const

// Default category images
export const CATEGORY_IMAGES: Record<string, string> = {
  "Show All": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
  "Laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
  "Laptop Accessories": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&h=300&fit=crop",
  "Chargers": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
  "Keyboards": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
  "Mouse": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
  "Monitors": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop"
}

export const products: Product[] = [
  {
    id: "prod_001",
    slug: "gaming-laptop-rtx4060",
    name: "Gaming Laptop RTX 4060",
    title: "Gaming Laptop RTX 4060",
    sku: "GL-4060",
    description: "High-performance gaming laptop with RTX 4060, 16GB RAM, 512GB SSD, and 144Hz display.",
    price: 89999,
    mrp: 109999,
    quantity: 5,
    stock: 5,
    status: "active",
    category: "Laptops",
    brand: "ASUS",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_002",
    slug: "mechanical-keyboard-rgb",
    name: "Mechanical Gaming Keyboard RGB",
    title: "Mechanical Gaming Keyboard RGB",
    sku: "KB-RGB",
    description: "Cherry MX Blue switches, RGB backlighting, programmable keys, and aluminum frame.",
    price: 7999,
    mrp: 9999,
    quantity: 15,
    stock: 15,
    status: "active",
    category: "Keyboards",
    brand: "Corsair",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400&h=300&fit=crop"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_003",
    slug: "4k-monitor-27inch",
    name: "4K Monitor 27 inch",
    title: "4K Monitor 27 inch",
    sku: "MON-4K27",
    description: "27-inch 4K UHD monitor with IPS panel, 60Hz refresh rate, and USB-C connectivity.",
    price: 25999,
    mrp: 32999,
    quantity: 8,
    stock: 8,
    status: "active",
    category: "Monitors",
    brand: "Dell",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1551739440-5dd934d3a94a?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_004",
    slug: "wireless-gaming-mouse",
    name: "Wireless Gaming Mouse",
    title: "Wireless Gaming Mouse",
    sku: "MS-WG",
    description: "High-precision wireless gaming mouse with 25,600 DPI, RGB lighting, and 70-hour battery.",
    price: 4999,
    mrp: 6999,
    quantity: 20,
    stock: 20,
    status: "active",
    category: "Mouse",
    brand: "Logitech",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&h=300&fit=crop"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_005",
    slug: "ssd-1tb-nvme",
    name: "1TB NVMe SSD",
    title: "1TB NVMe SSD",
    sku: "SSD-1TB",
    description: "High-speed 1TB NVMe SSD with 3,500 MB/s read speeds and 5-year warranty.",
    price: 8999,
    mrp: 12999,
    quantity: 12,
    stock: 12,
    status: "active",
    category: "Storage",
    brand: "Samsung",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"],
    updatedAt: new Date().toISOString(),
  }
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getCategories(): string[] {
  return Array.from(new Set(products.map((p) => p.category))).sort()
}

export function searchProducts(q: string) {
  const query = q.trim().toLowerCase()
  if (!query) return products
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.brand || "").toLowerCase().includes(query),
  )
}
