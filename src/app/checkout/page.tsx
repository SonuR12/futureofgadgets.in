"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type CartItem = { productId: string; qty: number; title?: string; price?: number; image?: string }

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Address
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [line1, setLine1] = useState("")
  const [line2, setLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [email, setEmail] = useState("")

  // Payment + delivery
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod")
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    const d = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
    return d.toISOString().slice(0, 10)
  })

  useEffect(() => {
    try {
      // Try to read from common keys
      const raw = localStorage.getItem("cart") || localStorage.getItem("v0_cart")
      if (raw) {
        const parsed = JSON.parse(raw)
        const normalized: CartItem[] = (parsed?.items || parsed || []).map((it: any) => ({
          productId: it.productId || it.id || it.slug || it.product?.id,
          qty: Number(it.qty || it.quantity || 1),
          title: it.title || it.name || it.product?.title,
          price: it.price ?? it.product?.price,
          image: it.image || it.product?.image,
        }))
        setItems(normalized.filter((it) => !!it.productId))
      }
    } catch {
      // ignore
    }
  }, [])

  const total = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0)

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: String(it.productId), qty: Number(it.qty || 1) })),
          address: { fullName, phone, line1, line2, city, state, zip },
          paymentMethod,
          deliveryDate: new Date(deliveryDate).toISOString(),
          userEmail: email || undefined,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Failed to place order")
      }
      // Clear cart (attempt common keys)
      localStorage.removeItem("cart")
      localStorage.removeItem("v0_cart")

      router.push("/checkout/success")
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-foreground text-balance">Checkout</h1>

      {items.length === 0 ? (
        <p className="text-foreground/80">Your cart is empty.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <form onSubmit={submitOrder} className="md:col-span-2 grid gap-6">
            <section className="rounded-md border border-border p-4">
              <h2 className="mb-4 text-lg font-medium text-foreground">Contact & Address</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">Full Name</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">Phone</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-foreground/80">Email (for receipt)</label>
                  <input
                    type="email"
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-foreground/80">Address Line 1</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-foreground/80">Address Line 2</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">City</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">State</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">ZIP</label>
                  <input
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-border p-4">
              <h2 className="mb-4 text-lg font-medium text-foreground">Payment & Delivery</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">Payment Method</label>
                  <select
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="card">Card (Mock)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-foreground/80">Delivery Date</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-border bg-background p-2"
                    value={deliveryDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <aside className="rounded-md border border-border p-4">
            <h2 className="mb-4 text-lg font-medium text-foreground">Order Summary</h2>
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={`${it.productId}`} className="flex items-center gap-3">
                  <img
                    src={it.image || "/placeholder.svg?height=48&width=48&query=product"}
                    alt={`${it.title || it.productId} image`}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-foreground">{it.title || it.productId}</div>
                    <div className="text-xs text-foreground/70">Qty: {it.qty}</div>
                  </div>
                  <div className="text-sm text-foreground/80">
                    ₹{(((it.price || 0) * (it.qty || 0)) / 100).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-4 text-right text-sm">
              <span className="text-foreground/70">Total: </span>
              <span className="font-medium text-foreground">₹{(total / 100).toFixed(2)}</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
