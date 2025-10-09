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
import Loading from "../loading"

type CartItem = { productId: string; qty: number; title?: string; price?: number; image?: string }

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "wallet" | "cod">("cod")
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

  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [upiId, setUpiId] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [selectedWallet, setSelectedWallet] = useState("")

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
    } catch {}
  }, [])

  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0)
  const shipping = 0
  const total = subtotal + shipping

  async function submitOrder(data: CheckoutForm) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({ productId: String(it.productId), qty: Number(it.qty || 1) })),
          address: { fullName: data.fullName, phone: data.phone, line1: data.line1, line2: data.line2, city: data.city, state: data.state, zip: data.zip },
          paymentMethod,
          deliveryDate: new Date(data.deliveryDate).toISOString(),
          userEmail: data.email || undefined,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Failed to place order")
      }
      clearCart()
      router.push("/checkout/success")
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
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
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center">
            {/* Empty Cart Illustration */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-blue-50 rounded-full"></div>
              <div className="absolute inset-8 bg-blue-100 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. Start shopping to find amazing products!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="px-8 py-3.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center gap-2 transition-all"
              >
                View Cart
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-600">On all orders above ₹500</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-600">100% secure transactions</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <ArrowRight className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Easy Returns</h3>
                <p className="text-sm text-gray-600">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 text-sm mt-1">Complete your purchase</p>
        </div>

        <form onSubmit={handleSubmit(submitOrder)}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input
                      {...register("fullName")}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <Input
                      {...register("phone")}
                      type="number"
                      placeholder="+91 99XXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <Input
                      {...register("line1")}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.line1 && <p className="text-xs text-red-600 mt-1">{errors.line1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <Input
                      {...register("line2")}
                      placeholder="Apartment, suite, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <Input
                      {...register("city")}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <Input
                      {...register("state")}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <Input
                      {...register("zip")}
                      placeholder="123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.zip && <p className="text-xs text-red-600 mt-1">{errors.zip.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                    <Controller
                      control={control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <div className="relative calendar-wrapper">
                          <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full px-3 py-2 bg-transparent hover:bg-transparent focus-visible:ring-0 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between text-left"
                          >
                            <span>{field.value ? format(field.value, "PPP") : "Pick a date"}</span>
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                          </button>
                          {showCalendar && (
                            <div className="absolute z-50 bottom-full mb-2 bg-white border border-gray-300 rounded-md shadow-lg calendar-wrapper">
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

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                  {[
                    { id: 'cod', icon: Banknote, label: 'COD' },
                    { id: 'upi', icon: Smartphone, label: 'UPI' },
                    { id: 'card', icon: CreditCard, label: 'Card' },
                    { id: 'netbanking', icon: Building2, label: 'Net Banking' },
                    { id: 'wallet', icon: Wallet, label: 'Wallet' }
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id as any)}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        paymentMethod === id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === id ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className={`text-xs font-medium block ${paymentMethod === id ? 'text-blue-600' : 'text-gray-700'}`}>{label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-700">Pay with cash when your order is delivered</p>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <Input
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={16}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                        <Input
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <Input
                          placeholder="123"
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="">Choose Bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Wallet</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedWallet}
                      onChange={(e) => setSelectedWallet(e.target.value)}
                    >
                      <option value="">Choose Wallet</option>
                      <option value="paytm">Paytm</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="googlepay">Google Pay</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((it) => (
                    <div key={it.productId} className="flex gap-3">
                      <img
                        src={it.image || "/placeholder.svg"}
                        alt={it.title || "Product"}
                        className="w-14 h-14 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${it.productId}`} className="text-sm font-medium truncate hover:text-blue-600 block">{it.title}</Link>
                        <p className="text-xs text-gray-500">Qty: {it.qty}</p>
                        <p className="text-sm font-semibold text-blue-600">₹{(it.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-blue-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing order, you agree to our terms
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
