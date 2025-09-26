import type { Product, Order, User } from "./types"

const products: Product[] = [
  {
    id: "p1",
    slug: "smart-watch-alpha",
    title: "Smart Watch Alpha",
    description: "Feature-packed smartwatch with heart-rate monitor and GPS.",
    price: 4999,
    image: "/smart-watch.jpg",
    category: "Wearables",
    stock: 42,
  },
  {
    id: "p2",
    slug: "usb-c-fast-charger",
    title: "USB-C Fast Charger 65W",
    description: "Compact, travel-friendly fast charger with PD support.",
    price: 1899,
    image: "/usb-c-charger.jpg",
    category: "Accessories",
    stock: 120,
  },
  {
    id: "p3",
    slug: "wireless-headphones-pro",
    title: "Wireless Headphones Pro",
    description: "Noise-cancelling over-ear headphones with 40h battery.",
    price: 8999,
    image: "/diverse-people-listening-headphones.png",
    category: "Audio",
    stock: 27,
  },
]

const orders: Order[] = []

const users: User[] = [
  {
    id: "u1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    isActive: true,
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Priya Patel",
    email: "priya@example.com",
    isActive: true,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "u3",
    name: "Rahul Verma",
    email: "rahul@example.com",
    isActive: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
]

export function getProducts() {
  return products
}

export function findProductById(id: string) {
  return products.find((p) => p.id === id) || null
}

export function findProductBySlug(slug: string) {
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
    .map((p) => ({ id: p.id, slug: p.slug, title: p.title, image: p.image, price: p.price }))
}

export function getOrders() {
  return orders
}

export function addOrder(o: Order) {
  orders.unshift(o)
  return o
}

export function getUsers() {
  return users
}

export function getActiveUsers() {
  return users.filter((u) => u.isActive)
}
