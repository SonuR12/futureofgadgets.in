import type { Metadata } from "next"
import CartView from "@/components/cart/cart-view"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review items in your cart and proceed to checkout.",
  alternates: { canonical: "/cart" },
}

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground text-balance">Your Cart</h1>
      </header>
      <CartView />
    </main>
  )
}
