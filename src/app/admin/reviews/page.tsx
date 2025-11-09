'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2, MessageSquare, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import LoadingButton from '@/components/ui/loading-button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

type Review = {
  id: string
  productId: string
  userName: string
  rating: number
  comment: string
  adminReply?: string
  createdAt: string
}

type CustomerReview = {
  id: string
  imageUrl: string
  customerName: string
  message: string
  rating: number
  ratingCount: number
  createdAt: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [replyLoading, setReplyLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [newReview, setNewReview] = useState({ productId: '', rating: 0, comment: '', userName: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'product' | 'customer'>('product')
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([])
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [customerImage, setCustomerImage] = useState<File | null>(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [deleteCustomerReviewId, setDeleteCustomerReviewId] = useState<string | null>(null)
  const [customerFormData, setCustomerFormData] = useState({ customerName: '', message: '', rating: 5, ratingCount: 0 })
  const [editingCustomerReview, setEditingCustomerReview] = useState<CustomerReview | null>(null)

  useEffect(() => {
    fetchReviews()
    fetchProducts()
    fetchCustomerReviews()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products')
    }
  }

  const fetchCustomerReviews = async () => {
    try {
      const res = await fetch('/api/customer-reviews')
      const data = await res.json()
      setCustomerReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to load customer reviews')
    }
  }

  const handleAddCustomerReview = async () => {
    if ((!customerImage && !editingCustomerReview) || !customerFormData.customerName || !customerFormData.message) {
      toast.error('Please fill all fields')
      return
    }
    
    setCustomerLoading(true)
    try {
      const formData = new FormData()
      if (customerImage) formData.append('image', customerImage)
      formData.append('customerName', customerFormData.customerName)
      formData.append('message', customerFormData.message)
      formData.append('rating', customerFormData.rating.toString())
      formData.append('ratingCount', customerFormData.ratingCount.toString())
      
      const url = editingCustomerReview ? `/api/customer-reviews/${editingCustomerReview.id}` : '/api/customer-reviews'
      const method = editingCustomerReview ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        body: formData
      })
      
      if (res.ok) {
        toast.success(editingCustomerReview ? 'Customer review updated' : 'Customer review added')
        await fetchCustomerReviews()
        setShowCustomerDialog(false)
        setCustomerImage(null)
        setCustomerFormData({ customerName: '', message: '', rating: 5, ratingCount: 0 })
        setEditingCustomerReview(null)
      } else {
        toast.error('Failed to save customer review')
      }
    } catch (error) {
      toast.error('Failed to save customer review')
    } finally {
      setCustomerLoading(false)
    }
  }

  const handleDeleteCustomerReview = async () => {
    if (!deleteCustomerReviewId) return
    
    try {
      const res = await fetch(`/api/customer-reviews/${deleteCustomerReviewId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Customer review deleted')
        fetchCustomerReviews()
        setDeleteCustomerReviewId(null)
      }
    } catch (error) {
      toast.error('Failed to delete customer review')
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      setReviews(data.reviews)
    } catch (error) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return
    
    setReplyLoading(true)
    try {
      const res = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText })
      })
      
      if (res.ok) {
        toast.success('Reply added successfully')
        setShowReplyDialog(false)
        setReplyText('')
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to add reply')
    } finally {
      setReplyLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteReviewId) return
    
    try {
      const res = await fetch(`/api/reviews/${deleteReviewId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Review deleted')
        fetchReviews()
        setDeleteReviewId(null)
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const handleAddReview = async () => {
    if (!newReview.productId || !newReview.rating || !newReview.comment) {
      toast.error('Please fill all fields')
      return
    }
    
    setAddLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })
      
      if (res.ok) {
        toast.success('Review added successfully')
        setShowAddDialog(false)
        setNewReview({ productId: '', rating: 0, comment: '', userName: '' })
        fetchReviews()
      }
    } catch (error) {
      toast.error('Failed to add review')
    } finally {
      setAddLoading(false)
    }
  }

 if (loading || !reviews)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm sm:text-base">Loading reviews...</p>
      </div>
    </div>
  );


  return (
    <div className="p-6 max-w-6xl ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        {/* <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg "
        >
          <Plus className="w-4 h-4" />
          Add
        </Button> */}
      </div>
      
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('product')}
          className={`pb-2 px-4 font-medium transition ${activeTab === 'product' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Product Reviews
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`pb-2 px-4 font-medium transition ${activeTab === 'customer' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Customer Reviews
        </button>
      </div>
      
      <div className="space-y-4">
        {activeTab === 'product' && (
          <>
            <div className="mb-4">
              <Button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add Product Review
              </Button>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No reviews yet</div>
            ) : reviews.map((review) => (
          <div key={review.id} className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{review.userName}</div>
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                  ))}
                <div className="text-xs text-gray-500 ml-1">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
                  
                </div>
                
              </div>
              <div className="flex gap-2">
                {!review.adminReply && (
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      setReplyText(review.adminReply || '')
                      setShowReplyDialog(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setDeleteReviewId(review.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            
           <p className="text-gray-700 text-sm sm:text-base mb-3 break-words whitespace-pre-wrap">{review.comment}</p>
            
            {review.adminReply && (
              <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <div className="text-sm font-semibold text-blue-900 mb-1">Admin Reply:</div>
                <div className="text-sm text-gray-700">{review.adminReply}</div>
              </div>
            )}
            
            
          </div>
          ))}
          </>
        )}
        
        {activeTab === 'customer' && (
          <>
            <div className="mb-4">
              <Button onClick={() => {
                setEditingCustomerReview(null)
                setCustomerFormData({ customerName: '', message: '', rating: 5, ratingCount: 0 })
                setCustomerImage(null)
                setShowCustomerDialog(true)
              }} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Customer Review
              </Button>
            </div>
            {customerReviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No customer reviews yet</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customerReviews.map((review) => (
                  <div key={review.id} className="relative group border rounded-lg overflow-hidden">
                    <img src={review.imageUrl} alt="Customer review" className="w-full h-60 object-cover" />
                    <div className="p-3 bg-white">
                      <h3 className="font-semibold text-sm truncate">{review.customerName}</h3>
                      <div className="flex items-center gap-1 my-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        {review.ratingCount > 0 && <span className="text-xs text-gray-500 ml-1">{review.ratingCount}</span>}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{review.message}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingCustomerReview(review)
                          setCustomerFormData({
                            customerName: review.customerName,
                            message: review.message,
                            rating: review.rating,
                            ratingCount: review.ratingCount
                          })
                          setCustomerImage(null)
                          setShowCustomerDialog(true)
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCustomerReviewId(review.id)}
                        className="p-2 bg-red-600 text-white rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>


      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowReplyDialog(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleReply}
                loading={replyLoading}
              >
                Submit Reply
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Product</label>
              <Select value={newReview.productId} onValueChange={(value) => setNewReview({ ...newReview, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Customer Name</label>
              <input
                type="text"
                value={newReview.userName}
                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Write the review..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddDialog(false)
                  setNewReview({ productId: '', rating: 0, comment: '', userName: '' })
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleAddReview}
                loading={addLoading}
              >
                Add Review
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomerReview ? 'Edit' : 'Add'} Customer Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Customer Name</label>
              <input
                type="text"
                value={customerFormData.customerName}
                onChange={(e) => setCustomerFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCustomerFormData(prev => ({ ...prev, rating: star }))}
                    type="button"
                  >
                    <Star className={`w-6 h-6 ${star <= customerFormData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
                <input
                  type="number"
                  min='1'
                  max='5'
                  value={customerFormData.ratingCount || ''}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, ratingCount: Number(e.target.value) || 0 }))}
                  placeholder="Count"
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <textarea
                value={customerFormData.message}
                onChange={(e) => setCustomerFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter review message"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Review Image (Max 10MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  
                  if (file.size > 10485760) {
                    toast.error('File too large. Maximum is 10MB')
                    e.target.value = ''
                    return
                  }
                  
                  if (file.size <= 6291456) {
                    setCustomerImage(file)
                    return
                  }
                  
                  const img = new Image()
                  img.src = URL.createObjectURL(file)
                  img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')!
                    canvas.width = img.width
                    canvas.height = img.height
                    ctx.drawImage(img, 0, 0)
                    
                    const compress = (quality: number) => {
                      canvas.toBlob((blob) => {
                        if (blob && blob.size > 6291456 && quality > 0.5) {
                          compress(quality - 0.05)
                        } else if (blob && blob.size > 6291456) {
                          toast.error('Image too large after compression')
                          e.target.value = ''
                        } else if (blob) {
                          setCustomerImage(new File([blob], file.name, { type: 'image/jpeg' }))
                        }
                      }, 'image/jpeg', quality)
                    }
                    compress(0.95)
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              {customerImage ? (
                <img src={URL.createObjectURL(customerImage)} alt="Preview" className="mt-2 w-full h-40 object-cover rounded" />
              ) : editingCustomerReview ? (
                <img src={editingCustomerReview.imageUrl} alt="Current" className="mt-2 w-full h-40 object-cover rounded" />
              ) : null}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCustomerDialog(false)
                  setCustomerImage(null)
                  setCustomerFormData({ customerName: '', message: '', rating: 5, ratingCount: 0 })
                  setEditingCustomerReview(null)
                }}
              >
                Cancel
              </Button>
              <LoadingButton onClick={handleAddCustomerReview} loading={customerLoading}>
                {editingCustomerReview ? 'Update' : 'Add'}
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteReviewId} onOpenChange={(open) => !open && setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCustomerReviewId} onOpenChange={(open) => !open && setDeleteCustomerReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomerReview} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
