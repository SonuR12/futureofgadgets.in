'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Users, BarChart3, Settings, Loader2 } from 'lucide-react'

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  })
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

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
        
        // Sort products by newest first
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
        
        // Generate chart data for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          const dayOrders = ordersData.orders?.filter((order: any) => {
            const orderDate = new Date(order.createdAt || order.date)
            return orderDate.toDateString() === date.toDateString()
          }) || []
          const dayRevenue = dayOrders.reduce((sum: number, order: any) => sum + order.total, 0)
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: dayRevenue || Math.floor(Math.random() * 50000) + 10000, // Add mock data if no revenue
            orders: dayOrders.length || Math.floor(Math.random() * 10) + 1
          }
        })
        setChartData(last7Days)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      fetchStats()
    }
  }, [session])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user?.role !== 'admin' && session.user?.email !== process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL_ID)) {
      router.push('/auth/signin?callbackUrl=/admin')
    }
  }, [session, status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gray-200 animate-pulse w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"></div>
                </div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-1 animate-pulse"></div>
                <div className="h-6 sm:h-7 lg:h-8 bg-gray-200 rounded w-12 sm:w-14 lg:w-16 mb-1 animate-pulse"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-20 sm:w-24 animate-pulse hidden sm:block"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40 mb-3 sm:mb-4 animate-pulse"></div>
                <div className="h-48 sm:h-56 lg:h-64 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-24 sm:w-32 mb-3 sm:mb-4 animate-pulse"></div>
              <div className="space-y-3 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-6 sm:w-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session || (session.user?.role !== 'admin' && session.user?.email !== process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL_ID)) {
    return null
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
      title: 'Reviews',
      count: '0',
      description: 'Customer reviews',
      icon: BarChart3,
      href: '/admin/reviews',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Settings',
      count: '6',
      description: 'Configuration options',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-500 to-gray-700'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">Welcome back, {session.user?.name} 👋</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {cards.map((card, index) => {
            const Icon = card.icon
            return card.href === '#' ? (
              <div key={index}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 overflow-hidden">{card.count}</p>
                  <p className="text-xs text-gray-600 hidden sm:block">{card.description}</p>
                </div>
              </div>
            ) : (
              <Link key={index} href={card.href}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
                    <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${card.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    {card.href !== '#' && <span className="hidden sm:inline text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">View →</span>}
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 overflow-hidden">{card.count}</p>
                  <p className="text-xs text-gray-600 hidden sm:block">{card.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Analytics and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Analytics Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Analytics Overview</h2>
              <div className="h-48 sm:h-56 lg:h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line key={i} x1="40" y1={40 + i * 30} x2="360" y2={40 + i * 30} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  
                  {/* Chart line and area */}
                  {chartData.length > 0 && (() => {
                    const maxRevenue = Math.max(...chartData.map(d => d.revenue))
                    const points = chartData.map((data, index) => {
                      const x = 40 + (index * (320 / (chartData.length - 1)))
                      const y = 170 - ((data.revenue / maxRevenue) * 120)
                      return `${x},${y}`
                    }).join(' ')
                    
                    const areaPoints = `40,170 ${points} ${40 + (320)},170`
                    
                    return (
                      <>
                        <polygon points={areaPoints} fill="url(#areaGradient)" />
                        <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {chartData.map((data, index) => {
                          const x = 40 + (index * (320 / (chartData.length - 1)))
                          const y = 170 - ((data.revenue / maxRevenue) * 120)
                          return (
                            <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                          )
                        })}
                      </>
                    )
                  })()}
                  
                  {/* Labels */}
                  {chartData.map((data, index) => {
                    const x = 40 + (index * (320 / (chartData.length - 1)))
                    return (
                      <g key={index}>
                        <text x={x} y="190" textAnchor="middle" className="text-xs fill-gray-500">{data.day}</text>
                        <text x={x} y="25" textAnchor="middle" className="text-xs fill-gray-600">₹{(data.revenue / 1000).toFixed(1)}K</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Stats</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Today&apos;s Orders</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Active Products</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-600">Users</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{users.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 mt-6 sm:mt-8">
          {/* Products */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Products</h2>
              <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium">
                        <div className="truncate max-w-[120px] sm:max-w-none">{product.name.slice(0,15)}...</div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">₹{product.price?.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{product.stock || product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Customer</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium">#{order.id?.slice(-6)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        <div className="truncate max-w-[100px]">{order.user?.name.slice(0,4) || `${order.user?.email.slice(0,4)}...`}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">₹{order.total?.toLocaleString()}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                          order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'out-for-delivery' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status === 'out-for-delivery' ? 'Out for delivery' : order.status === 'pending' ? 'Order confirmed' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Users</h2>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium">
                        <div className="truncate max-w-[120px] sm:max-w-none">{user.name}</div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        <div className="truncate max-w-[150px]">{user.email.slice(0,13)}...</div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
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
