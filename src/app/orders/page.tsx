'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Package, Truck, CheckCircle, Star, Loader } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Loading from '../loading'
import { toast } from 'sonner'

type Order = {
  id: string
  items: {
    productId: string
    name: string
    price: number
    qty: number
    image?: string
  }[]
  total: number
  status: string
  statusHistory?: Array<{
    status: string
    timestamp: string
    note?: string
  }>
  address: {
    fullName: string
    phone: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  paymentMethod: string
  deliveryDate: string
  billUrl?: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  refundTransactionId?: string
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null)

  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewProduct, setReviewProduct] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/orders')
      return
    }
    
    const fetchOrders = async () => {
      try {
        const [ordersResponse, productsResponse, reviewsResponse] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
          fetch('/api/reviews')
        ])
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          // console.log('Orders data:', ordersData.orders)
          setOrders(ordersData.orders)
        }
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setProducts(productsData)
          setAllProducts(productsData)
        }
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json()
            // Merge server reviews with any locally saved submitted markers
            const merged = reviewsData.reviews || []
            try {
              const raw = localStorage.getItem('v0_submitted_reviews')
              if (raw) {
                const local = JSON.parse(raw)
                // filter out duplicates
                local.forEach((lr: any) => {
                  if (!merged.some((r: any) => r.orderId === lr.orderId && r.productId === lr.productId)) {
                    merged.push(lr)
                  }
                })
              }
            } catch {
              // ignore localStorage issues
            }
            setReviews(merged)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
          <Loading/>
    )
  }

  if (!session) return null

  const canReview = (order: Order, productId: string) => {
    if (order.status !== 'delivered' && order.status !== 'shipped') return false
    const statusDate = new Date(order.updatedAt)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    if (statusDate < threeDaysAgo) return false
    const alreadyInState = reviews.some(r => r.orderId === order.id && r.productId === productId)
    if (alreadyInState) return false
    // Fallback to check localStorage markers in case state hasn't synced yet
    try {
      const raw = localStorage.getItem('v0_submitted_reviews')
      if (raw) {
        const local = JSON.parse(raw)
        if (local.some((r: any) => r.orderId === order.id && r.productId === productId)) return false
      }
    } catch {
      // ignore
    }
    return true
  }

  const handleReviewSubmit = async () => {
    if (!reviewProduct || !rating) {
      toast.error('Please provide a rating')
      return
    }
    
    setReviewLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: reviewProduct.orderId,
          productId: reviewProduct.productId,
          rating,
          comment: reviewComment || 'Good product'
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success('Review submitted successfully')
        // Use functional updater to avoid stale closures and update UI immediately
        setReviews((prev) => [...prev, { orderId: reviewProduct.orderId, productId: reviewProduct.productId }])
        // Persist a simple marker so the review option remains hidden on reload
        try {
          const key = 'v0_submitted_reviews'
          const raw = localStorage.getItem(key)
          const submitted = raw ? JSON.parse(raw) : []
          submitted.push({ orderId: reviewProduct.orderId, productId: reviewProduct.productId })
          localStorage.setItem(key, JSON.stringify(submitted))
        } catch {
          // ignore localStorage errors
        }
        setShowReviewDialog(false)
        setRating(0)
        setReviewComment('')
        setReviewProduct(null)
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Review error:', error)
      toast.error('Failed to submit review')
    } finally {
      setReviewLoading(false)
    }
  }





  return (
    <div className="min-h-screen bg-gray-100 mt-1">
      <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4">
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items[0]
            const product = products.find(p => p.id === firstItem?.productId)
            const imageUrl = product?.frontImage || product?.images?.[0] || '/placeholder.svg'
            
            return (
            <div key={order.id} className="bg-white">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <span className="text-xs sm:text-sm text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year:"numeric" })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex gap-3 sm:gap-4 mb-4">
                  <img 
                    src={imageUrl|| "/placeholder.svg"} 
                    alt={firstItem?.name}
                    className="w-16 h-16 sm:w-24 sm:h-24 object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2">{firstItem?.name}</h3>
                    {order.items.length > 1 && (
                      <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">and {order.items.length - 1} other item{order.items.length > 2 ? 's' : ''}</p>
                    )}
                    <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">₹{order.total}</p>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <span className="truncate">{order.address.city}, {order.address.state}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                   <div className="flex items-center gap-2 min-w-0">
                   <div className={`hidden sm:block w-2 h-2 mt-0.5 rounded-full ${
                      order.status === 'delivered' ? (order.refundTransactionId ? 'bg-orange-500' : 'bg-purple-500') :
                      order.status === 'out-for-delivery' ? 'bg-orange-500' :
                      order.status === 'shipped' ? 'bg-blue-500' :
                      order.status === 'cancelled' ? 'bg-red-500' :
                      'bg-green-400'
                    }`}></div>
                    <div className="min-w-0">
                      <span className={`text-xs sm:text-sm font-medium ${
                        order.status === 'delivered' ? (order.refundTransactionId ? 'text-orange-600' : 'text-purple-600') :
                        order.status === 'out-for-delivery' ? 'text-orange-600' :
                        order.status === 'shipped' ? 'text-blue-700' :
                        order.status === 'cancelled' ? 'text-red-600' :
                        'text-green-500'
                      }`}>
                        {order.status === 'out-for-delivery' ? 'Out for delivery' : order.status === 'pending' ? 'Order confirmed' : order.status === 'shipped' ? 'Shipped' : order.status === 'delivered' ? (order.refundTransactionId ? 'Refunded' : 'Delivered') : order.status === 'cancelled' ? 'Cancelled' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-0 sm:ml-2 block sm:inline">
                        on {new Date(order.status === 'pending' ? order.createdAt : order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(order.status === 'pending' ? order.createdAt : order.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                   </div>
                   <div className='flex gap-2'>

      
                  <Dialog open={showModal && selectedOrder?.id === order.id} onOpenChange={setShowModal}>
                    <DialogTrigger asChild>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedOrder(order)
                          setShowModal(true)
                        }}
                        className="flex items-center w-fit cursor-pointer gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 border border-blue-200 rounded-sm hover:bg-blue-50 whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto p-0">
                      <DialogHeader className="sr-only">
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="bg-gray-50">
                          {/* Order ID Header */}
                          <div className="bg-white px-3 sm:px-6 py-3 sm:py-4 border-b">
                            <p className="text-xs sm:text-sm text-gray-500">Order ID</p>
                            <p className="text-sm sm:text-lg font-semibold break-all">{selectedOrder.id}</p>
                          </div>
                          
                          <div className="grid lg:grid-cols-3 gap-3 sm:gap-6 p-3 sm:p-6">
                            {/* Left Column - Order Items */}
                            <div className="lg:col-span-2">
                              <div className="bg-white rounded-lg p-3 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Order Items ({selectedOrder.items.length})</h2>
                                
                                {/* Product List */}
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                  {selectedOrder.items.map((item, idx) => {
                                    const product = products.find(p => p.id === item.productId)
                                    const imageUrl = product?.frontImage || product?.images?.[0] || '/placeholder.svg'
                                    const showReview = canReview(selectedOrder, item.productId)
                                    return (
                                      <div key={idx} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b last:border-b-0">
                                        <img 
                                          src={imageUrl || "/placeholder.svg"} 
                                          alt={item.name}
                                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover border rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <Link href={`/products/${product?.slug || item.name?.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm sm:text-base font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 block">{item.name}</Link>
                                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Qty: {item.qty}</p>
                                           {(item as any).color && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                Color:
                                <span className="inline-block w-3 h-3 rounded-full border" style={{ backgroundColor: (item as any).color.toLowerCase() }}></span>
                                 {(item as any).color}
                              </p>
                            )}
                                          {/* {(item as any).color && <p className="text-xs sm:text-sm text-gray-600 mb-1">Color: {(item as any).color}</p>} */}
                                          {(item as any).selectedRam && (() => {
                                            const prod = allProducts.find(p => p.id === item.productId)
                                            const ramOption = prod?.ramOptions?.find((r: any) => r.size === (item as any).selectedRam)
                                            const ramPrice = ramOption?.price || 0
                                            return <p className="text-xs sm:text-sm text-gray-600 mb-1">RAM: {(item as any).selectedRam}{ramPrice !== 0 && ` (+₹${ramPrice.toLocaleString()})`}</p>
                                          })()}
                                          {(item as any).selectedStorage && (() => {
                                            const prod = allProducts.find(p => p.id === item.productId)
                                            const storageOption = prod?.storageOptions?.find((s: any) => s.size === (item as any).selectedStorage)
                                            const storagePrice = storageOption?.price || 0
                                            return <p className="text-xs sm:text-sm text-gray-600 mb-1">Storage: {(item as any).selectedStorage}{storagePrice !== 0 && ` (+₹${storagePrice.toLocaleString()})`}</p>
                                          })()}
                                          {(item as any).warranty && <p className="text-xs sm:text-sm text-gray-600 mb-1">Ext Warranty: {(item as any).warranty.duration} (+₹{(item as any).warranty.price.toLocaleString()})</p>}
                                          <p className="text-base sm:text-lg font-semibold mb-2">₹{item.price.toLocaleString()}</p>
                                          {showReview && (
                                            <button
                                              onClick={() => {
                                                setReviewProduct({ orderId: selectedOrder.id, productId: item.productId, productName: item.name })
                                                setShowModal(false)
                                                setTimeout(() => setShowReviewDialog(true), 100)
                                              }}
                                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:cursor-pointer transition-colors"
                                            >
                                              <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                                              Write a Review
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                                
                                {/* Order Status */}
                                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
                                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Order Status</h3>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                                    <span className="text-sm sm:text-base font-medium">Order Confirmed, {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                  {selectedOrder.status === 'shipped' && (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                                      <span className="text-sm sm:text-base font-medium">Shipped, {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                  )}
                                  {selectedOrder.status === 'out-for-delivery' && (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                                      <span className="text-sm sm:text-base font-medium">Out For Delivery, {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                  )}
                                  {selectedOrder.status === 'delivered' && (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${selectedOrder.refundTransactionId ? 'bg-orange-500' : 'bg-purple-500'} rounded-full flex-shrink-0`}></div>
                                      <span className="text-sm sm:text-base font-medium">{selectedOrder.refundTransactionId ? 'Refunded' : 'Delivered'}, {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                  )}
                                  {selectedOrder.status === 'cancelled' && (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                                      <span className="text-sm sm:text-base font-medium">Cancelled, {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(selectedOrder.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                    </div>
                                  )}
                                  <button 
                                    onClick={() => {
                                      setTrackingOrderId(selectedOrder.id)
                                      setShowTrackingModal(true)
                                    }}
                                    className="text-blue-600 text-xs sm:text-sm font-medium flex items-center gap-1 hover:underline"
                                  >
                                    See All Updates <span>›</span>
                                  </button>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                                      <button 
                                        onClick={() => setShowCancelDialog(true)}
                                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
                                      >
                                        Cancel Order
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => window.location.href = '/contact'}
                                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                                    >
                                      Contact Us
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Column - Details */}
                            <div className="space-y-3 sm:space-y-6">
                              {/* Delivery Details */}
                              <div className="bg-white rounded-lg p-3 sm:p-6">
                                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Delivery details</h3>
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600">
                                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                      </svg>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm sm:text-base font-medium">Home</p>
                                      <p className="text-xs sm:text-sm text-gray-600 break-words">{selectedOrder.address.line1}, {selectedOrder.address.city}, {selectedOrder.address.state}, ...</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600">
                                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                      </svg>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm sm:text-base font-medium break-words">{selectedOrder.address.fullName}</p>
                                      <p className="text-xs sm:text-sm text-gray-600">{selectedOrder.address.phone}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Price Details */}
                              <div className="bg-white rounded-lg p-3 sm:p-6">
                                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Price Details</h3>
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex justify-between text-sm sm:text-base text-gray-700">
                                    <span>Subtotal</span>
                                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm sm:text-base text-gray-700">
                                    <span>Delivery</span>
                                    <span className="text-green-600">FREE</span>
                                  </div>
                                  <hr className="border-gray-200" />
                                  <div className="flex justify-between items-center font-semibold text-base sm:text-lg">
                                    <span>Total Amount</span>
                                    <span>₹{selectedOrder.total.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 pt-1 sm:pt-2">
                                    <span>Payment Method</span>
                                    <span className="font-medium text-right">{selectedOrder.paymentMethod === 'cod' ? 'Cash On Delivery' : selectedOrder.paymentMethod.toUpperCase()}</span>
                                  </div>
                                  {selectedOrder.razorpayPaymentId && (
                                    <>
                                      <div className="flex justify-between text-xs sm:text-sm text-gray-600 pt-1 sm:pt-2">
                                        <span>Payment ID</span>
                                        <span className="font-mono text-xs break-all text-right">{selectedOrder.razorpayPaymentId}</span>
                                      </div>
                                      <div className="flex justify-between text-xs sm:text-sm text-gray-600 pt-1 sm:pt-2">
                                        <span>Transaction ID</span>
                                        <span className="font-mono text-xs break-all text-right">{selectedOrder.razorpayOrderId}</span>
                                      </div>
                                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="text-xs text-green-700 font-medium">✓ Payment Verified & Secured</p>
                                      </div>
                                    </>
                                  )}
                                  {selectedOrder.refundTransactionId && (
                                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 pt-1 sm:pt-2">
                                      <span>Refund Transaction ID</span>
                                      <span className="font-mono text-xs break-all text-right">{selectedOrder.refundTransactionId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                   {order.status === 'delivered' && order.billUrl && (
                    <button 
                      onClick={async () => {
                        const response = await fetch(order.billUrl!)
                        const blob = await response.blob()
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `bill-${order.id.slice(-8)}.jpg`
                        link.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm cursor-pointer font-medium text-green-600 border border-green-200 rounded-sm hover:bg-green-50 whitespace-nowrap"
                    >
                      Download Bill
                    </button>
                  )}

                               </div>
                  
                  {/* Order Tracking Modal */}
                  <Dialog open={showTrackingModal && trackingOrderId === order.id} onOpenChange={setShowTrackingModal}>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Tracking Details</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && trackingOrderId === order.id && (
                        <div className="py-4 space-y-4">
                          {/* Order Confirmed */}
                          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  Order Confirmed
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </p>
                                <p className="text-sm text-gray-700">Your order has been placed successfully.</p>
                              </div>
                            </div>
                          </div>

                          {/* Shipped */}
                          {(selectedOrder.status === 'shipped' || selectedOrder.status === 'out-for-delivery' || selectedOrder.status === 'delivered') && (
                            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    Shipped
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {new Date(selectedOrder.statusHistory?.find(h => h.status === 'shipped')?.timestamp || selectedOrder.updatedAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedOrder.statusHistory?.find(h => h.status === 'shipped')?.timestamp || selectedOrder.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <p className="text-sm text-gray-700">Your item has been shipped and is on the way.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Out For Delivery */}
                          {(selectedOrder.status === 'out-for-delivery' || selectedOrder.status === 'delivered') && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <Truck className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    Out For Delivery
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {new Date(selectedOrder.statusHistory?.find(h => h.status === 'out-for-delivery')?.timestamp || selectedOrder.updatedAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedOrder.statusHistory?.find(h => h.status === 'out-for-delivery')?.timestamp || selectedOrder.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <p className="text-sm text-gray-700">Your item is out for delivery and will arrive soon.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Delivered */}
                          {selectedOrder.status === 'delivered' && (
                            <div className={`border-l-4 ${selectedOrder.refundTransactionId ? 'border-orange-500 bg-orange-50' : 'border-purple-500 bg-purple-50'} p-4 rounded-r-lg`}>
                              <div className="flex items-start gap-3">
                                <CheckCircle className={`w-6 h-6 ${selectedOrder.refundTransactionId ? 'text-orange-600' : 'text-purple-600'} flex-shrink-0 mt-0.5`} />
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    {selectedOrder.refundTransactionId ? 'Refunded' : 'Delivered'}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedOrder.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <p className="text-sm text-gray-700">{selectedOrder.refundTransactionId ? 'Your order has been refunded.' : 'Your item has been delivered successfully.'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cancelled */}
                          {selectedOrder.status === 'cancelled' && (
                            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <Package className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    Cancelled
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {new Date(selectedOrder.updatedAt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(selectedOrder.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  </p>
                                  <p className="text-sm text-gray-700">Your order has been cancelled.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                 
                </div>
              </div>
            </div>
          )
        })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Start shopping to see your orders here</p>
          </div>
        )}
      </div>

      {/* Cancel Order Dialog - Outside order loop */}
      <Dialog open={showCancelDialog} onOpenChange={(open) => {
        setShowCancelDialog(open)
        if (!open) setCancelReason('')
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for cancellation <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelDialog(false)
                  setCancelReason('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={async () => {
                  setCancelLoading(true)
                  try {
                    const res = await fetch(`/api/orders/${selectedOrder?.id}/cancel`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reason: cancelReason })
                    })
                    if (res.ok) {
                      setOrders(orders.map(o => o.id === selectedOrder?.id ? { ...o, status: 'cancelled', updatedAt: new Date().toISOString() } : o))
                      setShowCancelDialog(false)
                      setCancelReason('')
                      setShowModal(false)
                    }
                  } catch (error) {
                    console.error('Error cancelling order:', error)
                  } finally {
                    setCancelLoading(false)
                  }
                }}
                disabled={cancelLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {cancelLoading && (
                 <Loader className="animate-spin h-4 w-4" />
                )}
                Cancel Order
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog - Outside order loop */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{reviewProduct?.productName}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Review</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReviewDialog(false)
                  setRating(0)
                  setReviewComment('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={!rating || reviewLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {reviewLoading && (
                  <Loader className="animate-spin h-4 w-4" />
                )}
                Submit Review
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}