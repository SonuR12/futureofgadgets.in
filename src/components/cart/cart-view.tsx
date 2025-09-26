"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCart, updateQty, removeFromCart, clearCart } from "@/lib/cart"
import Link from "next/link"

type CartItem = ReturnType<typeof getCart>[number]

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(getCart())
    const onStorage = () => setItems(getCart())
    const onCartUpdated = () => setItems(getCart())
    window.addEventListener("storage", onStorage)
    window.addEventListener("v0-cart-updated", onCartUpdated as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("v0-cart-updated", onCartUpdated as EventListener)
    }
  }, [])

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0), [items])

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <div className="text-muted-foreground">
          Your cart is empty.{" "}
          <Link href="/catalog" className="underline">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 rounded-lg border p-3">
                <img
                  src={`${i.image}?height=72&width=72&query=cart-item`}
                  alt={`${i.name} image`}
                  className="h-16 w-16 rounded-md border object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{i.name}</div>
                  <div className="text-sm text-muted-foreground">${i.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`qty-${i.id}`} className="sr-only">
                    Quantity for {i.name}
                  </label>
                  <Input
                    id={`qty-${i.id}`}
                    type="number"
                    min={0}
                    value={i.qty || 1}
                    onChange={(e) => {
                      const q = Math.max(0, Number(e.target.value || 0))
                      updateQty(i.id, q)
                      setItems(getCart())
                    }}
                    className="w-20"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      removeFromCart(i.id)
                      setItems(getCart())
                    }}
                    aria-label={`Remove ${i.name}`}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="text-foreground">
              Total: <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  clearCart()
                  setItems([])
                }}
              >
                Clear Cart
              </Button>
              <Button>Checkout (mock)</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
