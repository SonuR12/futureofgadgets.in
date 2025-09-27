// types.ts
export type Product = {
  id: string
  slug: string
  name: string
  title: string
  sku: string
  description: string
  price: number
  mrp?: number
  quantity: number
  stock: number
  status: "active" | "draft" | "archived"
  category: string
  brand?: string
  rating?: number
  image: string
  images?: string[]
  updatedAt: string
}

export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "customer" | "vendor"
  password?: string
  isActive?: boolean
  lastActiveAt?: string
}

export type Address = {
  fullName: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
}

export type PaymentMethod = "cod" | "paypal" | "stripe"

export type OrderItem = {
  productId: string
  title: string
  price: number
  qty: number
  image: string
}

export type Order = {
  id: string
  createdAt: string
  items: OrderItem[]
  total: number
  status: "pending" | "paid" | "shipped" | "delivered"
  address: Address
  paymentMethod: PaymentMethod
  deliveryDate: string
  userEmail?: string
}
