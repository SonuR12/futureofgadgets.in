"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/ui/loading-button"
import { toast } from "sonner"
import { getCart, updateQty, removeFromCart, clearCart } from "@/lib/cart"
import { useSession } from "next-auth/react"
import { AuthDialog } from "@/components/auth-dialog"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Trash2, Plus, Minus, Tag, Lock, Truck, ArrowRight } from "lucide-react"
import CartSkeleton from "@/components/skeletons/CartSkeleton"
import { useRouter } from "next/navigation"

type CartItem = ReturnType<typeof getCart>[number]
type Product = { id: string; quantity: number }

export default function CartView() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [hasStockIssue, setHasStockIssue] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    setItems(getCart())
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.map((p: any) => ({ id: p.id, quantity: p.quantity }))))
      .catch(() => {})
      .finally(() => setLoading(false))
    const onStorage = () => setItems(getCart())
    const onCartUpdated = () => setItems(getCart())
    window.addEventListener("storage", onStorage)
    window.addEventListener("v0-cart-updated", onCartUpdated as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("v0-cart-updated", onCartUpdated as EventListener)
    }
  }, [])

  useEffect(() => {
    if (items.length === 0 || products.length === 0) {
      setHasStockIssue(false)
      return
    }
    
    const hasIssue = items.some(item => {
      const product = products.find(p => p.id === item.id)
      return product && product.quantity < (item.qty || 1)
    })
    
    setHasStockIssue(hasIssue)
  }, [items, products])

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * (i.qty || 1), 0), [items])

  if (loading) {
    return <CartSkeleton />
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <div className="min-h-[60vh] flex items-center justify-center py-8">
          <div className="max-w-2xl w-full text-center px-4">
            {/* Empty Cart Illustration */}
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-blue-50 rounded-full"></div>
              <div className="absolute inset-4 sm:inset-8 bg-blue-100 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Your Cart is Empty</h2>
            <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to find amazing products!
            </p>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Shopping
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
              >
                View Cart
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-16">
              <div className="flex flex-col items-center p-4 sm:p-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Free Shipping</h3>
                <p className="text-xs sm:text-sm text-gray-600">On all orders above ₹1000</p>
              </div>
              <div className="flex flex-col items-center p-4 sm:p-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Secure Payment</h3>
                <p className="text-xs sm:text-sm text-gray-600">100% secure transactions</p>
              </div>
              <div className="flex flex-col items-center p-4 sm:p-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Easy Returns</h3>
                <p className="text-xs sm:text-sm text-gray-600">7-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="bg-white sm:rounded-lg sm:shadow-sm sm:border">
              <div className="p-3 sm:p-4 border-b">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  Cart ({items.length})
                </h2>
              </div>
              <ul className="divide-y">
                {items.map((i) => {
                  const product = products.find(p => p.id === i.id)
                  const availableStock = product?.quantity ?? 0
                  const isOutOfStock = product ? availableStock < (i.qty || 1) : false
                  
                  return (
                    <li key={i.id} className={`p-3 sm:p-4 hover:bg-white transition-colors ${isOutOfStock ? 'bg-gray-50' : ''}`}>
                      <div className="flex gap-2 sm:gap-4">
                        <Link href={`/products/${i.slug}`} className="flex-shrink-0">
                          <Image
                            src={i.image}
                            alt={i.name}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg border object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${i.slug}`}>
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">{i.name}</h3>
                          </Link>
                          {(i as any).color && (
                            <p className="text-xs text-gray-600 mb-1">Color: {(i as any).color}</p>
                          )}
                          {isOutOfStock ? (
                            <p className="text-xs sm:text-sm text-red-600 font-semibold mb-2">Out of Stock</p>
                          ) : (
                            <p className="text-xs sm:text-sm text-green-600 mb-2">In Stock</p>
                          )}
                          <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">₹{(i.price * (i.qty || 1)).toLocaleString()}</p>
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => {
                                const currentQty = i.qty || 1
                                if (currentQty === 1) {
                                  removeFromCart(i.id)
                                  setItems(getCart())
                                  toast.success('Removed from cart')
                                } else {
                                  updateQty(i.id, currentQty - 1)
                                  setItems(getCart())
                                }
                              }}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors rounded-full border hover:cursor-pointer"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="px-1 sm:px-2 py-1 sm:py-2 text-xs sm:text-sm font-medium min-w-[1rem] sm:min-w-[1.5rem] text-center">
                              {i.qty || 1}
                            </span>
                            <button
                              onClick={() => {
                                const product = products.find(p => p.id === i.id)
                                const currentQty = i.qty || 1
                                const availableQty = product?.quantity || 0
                                if (currentQty >= availableQty) {
                                  toast.error('Cannot add more', { description: `Only ${availableQty} items available in stock.` })
                                  return
                                }
                                updateQty(i.id, currentQty + 1)
                                setItems(getCart())
                              }}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors rounded-full border hover:cursor-pointer"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              removeFromCart(i.id)
                              setItems(getCart())
                              toast.success('Removed from cart')
                            }}
                            className="flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium hover:cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white sm:rounded-lg sm:shadow-sm sm:border p-4 sm:p-6 lg:sticky lg:top-24 space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold border-b pb-2 sm:pb-3">Order Summary</h2>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal ({items.reduce((sum, i) => sum + (i.qty || 1), 0)} items)</span>
                  <span className="font-medium">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
              </div>

              <div className="border-t pt-2 sm:pt-3">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-semibold">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
                </div>
                
                {hasStockIssue && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-red-600 font-semibold">Some items are out of stock. Please remove or update quantities.</p>
                  </div>
                )}
                
                {session ? (
                  <LoadingButton
                    loading={checkoutLoading}
                    disabled={hasStockIssue}
                    onClick={() => {
                      setCheckoutLoading(true)
                      router.push('/checkout')
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 sm:py-6 text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Checkout
                    {!checkoutLoading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    loading={checkoutLoading}
                    onClick={() => { setAuthMode('signin'); setShowAuthDialog(true) }}
                    disabled={hasStockIssue}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 sm:py-6 text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign in to Checkout
                    {!checkoutLoading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
                  </LoadingButton>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span>Free shipping on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  <span>Best price guaranteed</span>
                </div>
              </div>

              <button
                onClick={() => {
                  clearCart()
                  setItems([])
                  toast.success('Cart cleared')
                }}
                className="w-full mt-3 sm:mt-4 py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} mode={authMode} />
    </div>
  )
}
