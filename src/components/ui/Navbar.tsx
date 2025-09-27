"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search } from "lucide-react"
import { ThemeToggle } from "./theme-toggler"


export function Navbar() {
  const [count, setCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const router = useRouter()

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

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    try {
      const response = await fetch("/api/products")
      const products = await response.json()
      const filtered = products
        .filter((product: any) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.brand?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
      setSuggestions(filtered)
    } catch (error) {
      setSuggestions([])
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Scroll detection for navbar visibility
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollPos = window.scrollY
          const isScrollingDown = currentScrollPos > prevScrollPos

          setIsVisible(currentScrollPos < 100 ? true : !isScrollingDown)
          setPrevScrollPos(currentScrollPos)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [prevScrollPos])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-lg transition-transform duration-300 shadow-sm ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
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
          <div className="hidden md:flex items-center gap-6">
            <Link href="/category/laptops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Laptops
            </Link>
            <Link href="/category/desktops" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Desktops
            </Link>
            <Link href="/category/monitors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Monitors
            </Link>
            <Link href="/category/keyboards" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Keyboards
            </Link>
            <Link href="/category/headphones" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Headphones
            </Link>
            <Link href="/category" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              All Categories
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  setShowSuggestions(false)
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
              className="flex items-center relative"
            >
              <Input 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search laptops, keyboards, monitors..." 
                className="w-80 pr-10" 
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1 h-7 w-7 p-0 z-20"
                disabled={!searchQuery.trim()}
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 mt-1">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowSuggestions(false)
                        router.push(`/products/${product.slug}`)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b dark:border-gray-600 last:border-b-0 cursor-pointer"
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category} • ₹{product.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
          <Link href="/cart" aria-label="Open cart" className="relative z-10">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {/* <span className="hidden sm:inline">Cart</span> */}
              {count > 0 && (
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white"
                >
                  {count}
                </span>
              )}
            </Button>
          </Link>

          <ThemeToggle />

        </div>
      </nav>
    </header>
  )
}
