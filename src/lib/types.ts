export type Product = {
  id: string
  slug: string
  name: string
  sku: string
  description: string
  price: number
  mrp?: number
  quantity: number
  status: "active" | "draft" | "archived"
  category: string
  brand?: string
  rating?: number
  image: string
  updatedAt: string
}
