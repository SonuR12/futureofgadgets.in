// data.ts
import type { Product, Order, User } from "./types"

// --------------------- PRODUCTS ---------------------
export const products: Product[] = [
  {
    id: "p1",
    slug: "smart-watch-alpha",
    name: "Smart Watch Alpha",
    title: "Smart Watch Alpha",
    sku: "SW-A1",
    description: "Feature-packed smartwatch with heart-rate monitor and GPS.",
    price: 4999,
    quantity: 1,
    stock: 42,
    status: "active",
    category: "Wearables",
    image: "/smart-watch.jpg",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p2",
    slug: "usb-c-fast-charger",
    name: "USB-C Fast Charger 65W",
    title: "USB-C Fast Charger 65W",
    sku: "UC-65W",
    description: "Compact, travel-friendly fast charger with PD support.",
    price: 1899,
    quantity: 1,
    stock: 120,
    status: "active",
    category: "Accessories",
    image: "/usb-c-charger.jpg",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p3",
    slug: "wireless-headphones-pro",
    name: "Wireless Headphones Pro",
    title: "Wireless Headphones Pro",
    sku: "WH-PRO",
    description: "Noise-cancelling over-ear headphones with 40h battery.",
    price: 8999,
    quantity: 1,
    stock: 27,
    status: "active",
    category: "Audio",
    image: "/diverse-people-listening-headphones.png",
    updatedAt: new Date().toISOString(),
  },
]

// --------------------- USERS ---------------------
export const users: User[] = [
  {
    id: "u1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "customer",
    isActive: true,
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "customer",
    isActive: true,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "u3",
    name: "Rahul Verma",
    email: "rahul@example.com",
    role: "customer",
    isActive: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]

// --------------------- ORDERS ---------------------
export const orders: Order[] = []

// --------------------- PRODUCT FUNCTIONS ---------------------
export function getProducts(): Product[] {
  return products
}

export function findProductById(id: string): Product | null {
  return products.find((p) => p.id === id) || null
}

export function findProductBySlug(slug: string): Product | null {
  return products.find((p) => p.slug === slug) || null
}

export function searchProductsSuggestions(q: string, limit = 8) {
  const query = q.trim().toLowerCase()
  if (!query) return []
  return products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    )
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      image: p.image,
      price: p.price,
    }))
}

// --------------------- ORDER FUNCTIONS ---------------------
export function getOrders(): Order[] {
  return orders
}

export function addOrder(o: Order): Order {
  orders.unshift(o)
  return o
}

// --------------------- USER FUNCTIONS ---------------------
export function getUsers(): User[] {
  return users
}

export function getActiveUsers(): User[] {
  return users.filter((u) => u.isActive)
}
