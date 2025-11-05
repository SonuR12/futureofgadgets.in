"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { AuthDialog } from "@/components/auth-dialog"
import { clearCart } from "@/lib/cart"
import { Calendar } from "@/components/ui/calendar"
import { CreditCard, Smartphone, Building2, Wallet, Banknote, MapPin, User, Mail, Phone, ShoppingBag, ArrowRight, Package, Lock, CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import LoadingButton from "@/components/ui/loading-button"
import Loading from "../loading"

type CartItem = { productId: string; qty: number; title?: string; price?: number; image?: string; color?: string }

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(5, "Valid PIN code required"),
  deliveryDate: z.date(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "wallet" | "cod" | "razorpay">("cod")
  const [showCalendar, setShowCalendar] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      zip: "",
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  })

  const [stockStatus, setStockStatus] = useState<{[key: string]: {available: number, requested: number}}>({})
  const [hasStockIssue, setHasStockIssue] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCalendar && !(e.target as Element).closest('.calendar-wrapper')) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCalendar])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("v0_cart") || localStorage.getItem("cart")
      if (raw) {
        const parsed = JSON.parse(raw)
        console.log('Raw cart data:', parsed)
        const cartItems = Array.isArray(parsed) ? parsed : (parsed?.items || [])
        const normalized: CartItem[] = cartItems.map((it: any) => {
          console.log('Cart item:', it)
          return {
            productId: it.id || it.productId || it.slug,
            qty: Number(it.qty || it.quantity || 1),
            title: it.name || it.title,
            price: Number(it.price || 0),
            image: it.image || '/placeholder.svg',
            color: it.color,
          }
        })
        console.log('Normalized items:', normalized)
        setItems(normalized.filter((it) => !!it.productId && (it.price ?? 0) > 0))
      }
    } catch (err) {
      console.error('Cart parsing error:', err)
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) return
    
    async function checkStock() {
      try {
        const res = await fetch('/api/products')
        const products = await res.json()
        const status: {[key: string]: {available: number, requested: number}} = {}
        let hasIssue = false
        
        for (const item of items) {
          const product = products.find((p: any) => p.id === item.productId)
          if (product) {
            status[item.productId] = {
              available: product.quantity,
              requested: item.qty
            }
            if (product.quantity < item.qty) {
              hasIssue = true
            }
          }
        }
        
        setStockStatus(status)
        setHasStockIssue(hasIssue)
      } catch {}
    }
    
    checkStock()
  }, [items])

  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0)
  const shipping = 0
  const total = subtotal + shipping

  async function handleRazorpayPayment(data: CheckoutForm) {
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `order_${Date.now()}`
        })
      })

      if (!orderRes.ok) throw new Error('Failed to create payment order')

      const { orderId, amount, currency, keyId } = await orderRes.json()

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Electronic Store',
        description: 'Order Payment',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })

            if (!verifyRes.ok) throw new Error('Payment verification failed')

            const { verified, paymentId } = await verifyRes.json()

            if (verified) {
              await createOrder(data, paymentId, orderId)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (err: any) {
            setError(err?.message || 'Payment verification failed')
            setSubmitting(false)
          }
        },
        prefill: {
          name: data.fullName,
          email: data.email || session?.user?.email || '',
          contact: data.phone
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false)
            setError('Payment cancelled')
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setError(err?.message || 'Payment failed')
      setSubmitting(false)
    }
  }

  async function createOrder(data: CheckoutForm, razorpayPaymentId?: string, razorpayOrderId?: string) {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: String(it.productId), qty: Number(it.qty || 1), color: it.color })),
          address: { fullName: data.fullName, phone: data.phone, line1: data.line1, line2: data.line2, city: data.city, state: data.state, zip: data.zip },
          paymentMethod,
          deliveryDate: new Date(data.deliveryDate).toISOString(),
          userEmail: data.email || undefined,
          razorpayPaymentId,
          razorpayOrderId
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Failed to place order")
      }
      
      clearCart()
      sessionStorage.setItem('checkout_success', 'true')
      router.push("/checkout/success")
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
      throw err
    }
  }

  async function submitOrder(data: CheckoutForm) {
    setError(null)
    setSubmitting(true)
    
    try {
      if (paymentMethod === 'cod') {
        await createOrder(data)
      } else {
        if (!razorpayLoaded) {
          throw new Error('Payment gateway not loaded. Please refresh and try again.')
        }
        await handleRazorpayPayment(data)
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      // <main className="min-h-screen bg-gray-50 flex items-center justify-center">
<Loading/>
      // </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Sign in Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to continue with checkout</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setAuthMode('signin'); setShowAuthDialog(true) }}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setShowAuthDialog(true) }}
              className="flex-1 px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} mode={authMode} />
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4 py-20 sm:py-8">
        <div className="max-w-2xl w-full">
          <div className="text-center">
            {/* Empty Cart Illustration */}
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-blue-50 rounded-full"></div>
              <div className="absolute inset-6 sm:inset-8 bg-blue-100 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Content */}
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to find amazing products!
            </p>

            {/* Action Buttons */}
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
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Free Shipping</h3>
                <p className="text-xs sm:text-sm text-gray-600">On all orders above ₹1000</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Secure Payment</h3>
                <p className="text-xs sm:text-sm text-gray-600">100% secure transactions</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Easy Returns</h3>
                <p className="text-xs sm:text-sm text-gray-600">7-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
       <div className="my-3 sm:mb-0 px-2 sm:px-6 pt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 text-sm mt-1">Complete your purchase</p>
        </div>

        <form onSubmit={handleSubmit(submitOrder)} className="pb-32 sm:pb-0">
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:p-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Delivery Address */}
              <div className="bg-white border-b lg:border lg:rounded-lg px-4 py-4 sm:p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Delivery Information</h2>
                <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                    <Input {...register("fullName")} placeholder="John Doe" className="h-10 text-sm" />
                    {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                    <Input {...register("phone")} type="number" placeholder="+91 99XXXXXXXX" className="h-10 text-sm" />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email (Optional)</label>
                    <Input {...register("email")} type="email" placeholder="john@example.com" className="h-10 text-sm" />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Street Address</label>
                    <Input {...register("line1")} placeholder="House no, Building name" className="h-10 text-sm" />
                    {errors.line1 && <p className="text-xs text-red-600 mt-1">{errors.line1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Landmark (Optional)</label>
                    <Input {...register("line2")} placeholder="Near..." className="h-10 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">City</label>
                    <Input {...register("city")} placeholder="City" className="h-10 text-sm" />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
                    <Input {...register("state")} placeholder="State" className="h-10 text-sm" />
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">PIN Code</label>
                    <Input {...register("zip")} placeholder="123456" className="h-10 text-sm" />
                    {errors.zip && <p className="text-xs text-red-600 mt-1">{errors.zip.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery Date</label>
                    <Controller
                      control={control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <div className="relative calendar-wrapper">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="h-10 w-full px-3 bg-white border border-gray-300 rounded-md text-sm text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <span className="text-gray-900">{field.value ? format(field.value, "PPP") : "Select date"}</span>
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                          </button>
                          {showCalendar && (
                            <div className="absolute z-50 bottom-full mb-2 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg calendar-wrapper w-fit overflow-hidden">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) field.onChange(date)
                                  setShowCalendar(false)
                                }}
                                disabled={(date) => {
                                  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                  sevenDaysFromNow.setHours(0, 0, 0, 0)
                                  date.setHours(0, 0, 0, 0)
                                  return date.getTime() < sevenDaysFromNow.getTime()
                                }}
                                initialFocus
                              />
                            </div>
                          )}
                        </div>
                      )}
                    />
                    {errors.deliveryDate && <p className="text-xs text-red-600 mt-1">{errors.deliveryDate.message}</p>}
                  </div>
                </div>
              </div>

              
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border-b sm:border sm:rounded-lg px-4 py-4 sm:p-5 lg:sticky lg:top-24">
                <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Order Summary</h2>
                
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((it, idx) => {
                    const stock = stockStatus[it.productId]
                    const isOutOfStock = stock && stock.available < stock.requested
                    
                    return (
                      <div key={`${it.productId}-${idx}`} className={`flex gap-3 pb-3 border-b last:border-0 ${isOutOfStock ? 'opacity-60' : ''}`}>
                        <img src={it.image || "/placeholder.svg"} alt={it.title || "Product"} className="w-16 h-16 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${it.productId}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">{it.title}</Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">Qty: {it.qty}</span>
                            {it.color && <span className="text-xs text-gray-500">• {it.color}</span>}
                          </div>
                          {isOutOfStock ? (
                            <p className="text-xs font-medium text-red-600 mt-1">Out of Stock</p>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 mt-1">₹{(it.price || 0).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 py-4 border-t border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-4">
                  <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Payment</h3>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-blue-600" />
                      <Banknote className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Cash on Delivery</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod !== 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="paymentMethod" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 text-blue-600" />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Online Payment</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {/* Desktop Button */}
                <LoadingButton type="submit" loading={submitting} disabled={hasStockIssue} className="hidden sm:flex w-full h-12 mt-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 items-center justify-center">
                  {!submitting && <Package className="w-4 h-4 mr-2" />}
                  {submitting ? 'Processing...' : 'Place Order'}
                </LoadingButton>

                {/* Mobile Button */}
                <LoadingButton type="submit" loading={submitting} disabled={hasStockIssue} className="sm:hidden w-full h-12 mt-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Processing...' : `Place Order • ₹${total.toLocaleString()}`}
                </LoadingButton>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
