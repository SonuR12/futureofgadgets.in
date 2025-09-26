import type { Product } from "@/lib/types"

export const CATEGORIES = ["Audio", "Wearables", "Accessories"] as const

export const products: Product[] = [
  {
    id: "prod_001",
    slug: "wireless-headphones",
    name: "Wireless Headphones",
    title: "Wireless Headphones", // added
    sku: "WH-100",
    description: "Comfortable over-ear wireless headphones with rich bass and up to 30 hours of battery life.",
    price: 99.99,
    mrp: 149.99,
    quantity: 12,
    stock: 12, // added
    status: "active",
    category: "Audio",
    brand: "SonicPro",
    rating: 4.5,
    image: "/diverse-people-listening-headphones.png",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_002",
    slug: "smart-watch",
    name: "Smart Watch",
    title: "Smart Watch", // added
    sku: "SW-250",
    description: "Track your health and stay connected with notifications, GPS, and 7-day battery life.",
    price: 149.0,
    mrp: 199.0,
    quantity: 4,
    stock: 4, // added
    status: "active",
    category: "Wearables",
    brand: "ChronoMax",
    rating: 4.2,
    image: "/smart-watch.jpg",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_003",
    slug: "usb-c-charger",
    name: "USB-C Fast Charger 30W",
    title: "USB-C Fast Charger 30W", // added
    sku: "UC-030",
    description: "Compact 30W USB-C PD charger for phones, tablets, and small laptops. Includes smart protection.",
    price: 19.5,
    mrp: 29.0,
    quantity: 28,
    stock: 28, // added
    status: "draft",
    category: "Accessories",
    brand: "VoltEdge",
    rating: 4.0,
    image: "/usb-c-charger.jpg",
    updatedAt: new Date().toISOString(),
  },
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
      p.title.toLowerCase().includes(query) || // search by title too
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.brand || "").toLowerCase().includes(query),
  )
}
