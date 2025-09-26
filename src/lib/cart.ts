"use client"

type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image: string
  qty?: number
}

const KEY = "v0_cart"

function read(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(items))
  try {
    window.dispatchEvent(new CustomEvent("v0-cart-updated", { detail: { items } }))
  } catch {
    // no-op
  }
}

export function getCart(): CartItem[] {
  return read()
}

export function addToCart(item: CartItem) {
  const items = read()
  const idx = items.findIndex((i) => i.id === item.id)
  if (idx >= 0) {
    items[idx].qty = (items[idx].qty || 1) + 1
  } else {
    items.push({ ...item, qty: 1 })
  }
  write(items)
}

export function updateQty(id: string, qty: number) {
  const items = read()
  const idx = items.findIndex((i) => i.id === id)
  if (idx >= 0) {
    if (qty <= 0) items.splice(idx, 1)
    else items[idx].qty = qty
    write(items)
  }
}

export function removeFromCart(id: string) {
  const items = read().filter((i) => i.id !== id)
  write(items)
}

export function clearCart() {
  write([])
}
