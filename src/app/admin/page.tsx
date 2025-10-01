'use client'

import { useSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, BarChart3, Settings, Menu, LogOut } from 'lucide-react'
import Loading from '../loading'


export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  })
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/admin/orders'),
          fetch('/api/admin/users')
        ])
        
        const productsData = await productsRes.json()
        const ordersData = await ordersRes.json()
        const usersData = await usersRes.json()
        
        const totalRevenue = ordersData.orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0
        
        // Sort products by newest first (updatedAt or createdAt)
        const sortedProducts = productsData?.sort((a: any, b: any) => 
          new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
        ) || []
        
        setProducts(sortedProducts.slice(0, 5))
        setOrders(ordersData.orders?.slice(0, 5) || [])
        setUsers(Array.isArray(usersData) ? usersData.slice(0, 5) : [])
        
        setStats({
          products: productsData?.length || 0,
          orders: ordersData.orders?.length || 0,
          users: Array.isArray(usersData) ? usersData.length : 0,
          revenue: totalRevenue
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchStats()
    }
  }, [session])

  if (status === 'loading' || loading) {
    return <Loading />
  }

  if (!session || (session.user?.role !== 'admin' && session.user?.email !== 'admin@electronic.com')) {
    notFound()
  }

  const cards = [
    {
      title: 'Products',
      count: stats.products.toString(),
      description: 'Total products in inventory',
      icon: Package,
      href: '/admin/products',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Orders',
      count: stats.orders.toString(),
      description: 'Total orders received',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Users',
      count: stats.users.toString(),
      description: 'Registered users',
      icon: Users,
      href: '/admin/users',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Revenue',
      count: `₹${(stats.revenue / 1000).toFixed(1)}K`,
      description: 'Total revenue earned',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Settings',
      count: '12',
      description: 'Configuration options',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-500 to-gray-700'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back, {session.user?.name} 👋</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link key={index} href={card.href}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-blue-600 hover:text-blue-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{card.count}</p>
                  <p className="text-xs text-gray-600">{card.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Analytics and Tables Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Analytics Section */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Overview</h2>
              <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                📊 Chart Placeholder (use Recharts / Chart.js)
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Today&apos;s Orders</span>
                  <span className="font-semibold text-gray-900">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Products</span>
                  <span className="font-semibold text-gray-900">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Users</span>
                  <span className="font-semibold text-gray-900">{users.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
                <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                  View All →
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{product.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{product.stock || product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                  View All →
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">#{order.id?.slice(-6)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{order.user?.name || order.user?.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">₹{order.total?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
                  View All →
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
