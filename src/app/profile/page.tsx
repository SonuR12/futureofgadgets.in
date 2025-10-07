'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { User, Package, MapPin, Phone, Mail, Calendar, Edit2, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Loading from '../loading'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const savePhone = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await response.json()
      if (response.ok) {
        setEditingPhone(false)
        toast.success('Phone number updated successfully')
      } else {
        console.error('API Error:', data)
        toast.error(data.error || 'Failed to update phone number')
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to update phone number')
    }
  }

  const saveAddress = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      const data = await response.json()
      if (response.ok) {
        setEditingAddress(false)
        toast.success('Address updated successfully')
      } else {
        console.error('API Error:', data)
        toast.error(data.error || 'Failed to update address')
      }
    } catch (error) {
      console.error('Network Error:', error)
      toast.error('Failed to update address')
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/profile')
      return
    }
    
    const fetchProfile = async () => {
      setLoadingProfile(true)
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setPhone(data.phone || '')
          setAddress(data.address || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }
    
    const fetchOrders = async () => {
      setLoadingOrders(true)
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders.slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoadingOrders(false)
      }
    }
    
    fetchProfile()
    fetchOrders()
  }, [session, status, router])

  if (status === 'loading') {
    return (
          <Loading/>
    )
  }

  if (!session) return null

  const profileFields = [
    {
      label: 'Full Name',
      value: session.user?.name || 'Not provided',
      editable: false as const
    },
    {
      label: 'Email',
      value: (
        <div className="flex items-center gap-2">
          <span>{session.user?.email}</span>
          {session.user?.emailVerified ? (
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Verified</span>
          ) : (
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Not Verified</span>
          )}
        </div>
      ),
      editable: false as const
    },
    {
      label: 'Phone',
      value: loadingProfile ? <span className="text-gray-500">loading...</span> : (phone || 'Not provided'),
      editable: true as const,
      editing: editingPhone,
      setEditing: setEditingPhone,
      inputValue: phone,
      setInputValue: (value: string) => setPhone(value.replace(/\D/g, '')),
      save: savePhone,
      type: 'tel' as const,
      placeholder: 'Enter phone number'
    },
    {
      label: 'Address',
      value: loadingProfile ? <span className="text-gray-500">loading...</span> : (address || 'Not provided'),
      editable: true as const,
      editing: editingAddress,
      setEditing: setEditingAddress,
      inputValue: address,
      setInputValue: setAddress,
      save: saveAddress,
      type: 'textarea' as const,
      placeholder: 'Enter your address'
    }
  ]



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session.user?.name || 'User'}</h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {session.user?.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h2>
            <div className="space-y-4">
              {profileFields.map((field) => (
                <div key={field.label}>
                  <label className="text-sm font-medium text-gray-700">{field.label}</label>
                  {!field.editable ? (
                    <div className="text-gray-900">{field.value}</div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {field.editing ? (
                        <>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={field.inputValue}
                              onChange={(e) => field.setInputValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), field.save())}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                              placeholder={field.placeholder}
                              rows={2}
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={field.inputValue}
                              onChange={(e) => field.setInputValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && field.save()}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder={field.placeholder}
                            />
                          )}
                          <button onClick={field.save} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                            Save
                          </button>
                          <button onClick={() => field.setEditing(false)} className="text-gray-500 hover:text-gray-700">
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-900 flex-1">{field.value}</p>
                          {field.editable && !loadingProfile && (
                            <button onClick={() => field.setEditing(true)} className="text-blue-600 hover:text-blue-700">
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className='flex justify-between'>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </h2>
            <Link href='/orders' className='hover:underline text-blue-600'>View All</Link>
            </div>
            <div className="space-y-3">
              {loadingOrders ? (
                <div className='text-gray-500'>
                  loading...
                {/* // <div className="text-center py-4 flex items-center justify-center"> */}
                  {/* <Loader2 className='h-8 w-8 animate-spin text-blue-600'/> */}
                  {/* <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div> */}
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{order.total}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' || order.status === 'out-for-delivery' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'out-for-delivery' ? 'Out For Delivery' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">Edit Profile</h3>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">Addresses</h3>
              <p className="text-sm text-gray-500">Manage shipping addresses</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">Security</h3>
              <p className="text-sm text-gray-500">Change password & security</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}  