'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { User, Package, MapPin, Phone, Mail, Calendar, Edit2, X } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)

  const savePhone = () => {
    setEditingPhone(false)
    toast.success('Phone number updated successfully')
  }

  const saveAddress = () => {
    setEditingAddress(false)
    toast.success('Address updated successfully')
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=/profile')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
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
      value: session.user?.email,
      editable: false as const
    },
    {
      label: 'Phone',
      value: phone || 'Not provided',
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
      value: address || 'Not provided',
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

  const mockOrders = [
    { id: '1', date: '2024-01-15', total: 1299, status: 'Delivered', items: 2 },
    { id: '2', date: '2024-01-10', total: 899, status: 'Shipped', items: 1 },
    { id: '3', date: '2024-01-05', total: 2499, status: 'Processing', items: 3 }
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
                Member since January 2024
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
                    <p className="text-gray-900">{field.value}</p>
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
                          {field.editable && (
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </h2>
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date} • {order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{order.total}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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