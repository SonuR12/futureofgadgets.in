"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart } from "lucide-react"
import { ThemeToggle } from "./theme-toggler"


export function Navbar() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const sync = () => {
      const items = getCart()
      setCount(items.reduce((n, i) => n + (i.qty || 1), 0))
    }
    sync()
    const onStorage = () => sync()
    const onCartUpdated = () => sync()
    window.addEventListener("storage", onStorage)
    window.addEventListener("v0-cart-updated", onCartUpdated as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("v0-cart-updated", onCartUpdated as EventListener)
    }
  }, [])

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
            <img
              src="/store-logo.jpg?height=28&width=28&query=store-logo"
              alt="Store logo"
              className="h-7 w-7 rounded"
            />
            <span className="font-semibold text-foreground">Electronic</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
              Catalog
            </Link>
            <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">
              Search
            </Link>
            <Link href="/category/electronics" className="text-sm text-muted-foreground hover:text-foreground">
              Electronics
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action="/search" className="hidden md:block">
            <label htmlFor="q" className="sr-only">
              Search products
            </label>
            <Input id="q" name="q" placeholder="Search…" className="w-64" />
          </form>
          <Link href="/cart" aria-label="Open cart" className="relative">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {/* <span>Cart</span> */}
              <span
                aria-live="polite"
                aria-atomic="true"
                className="ml-1 inline-flex min-w-5 items-center justify-center rounded bg-foreground px-1.5 text-xs font-semibold text-background"
              >
                {count}
              </span>
            </Button>
          </Link>

          <ThemeToggle />

        </div>
      </nav>
    </header>
  )
}
