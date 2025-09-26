"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  image: string
  title: string
  description: string
  category: string
  price: number
  stock: number
}

export default function ProductAdminTable({ className }: { className?: string }) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products-db")
      const data = await response.json()
      setProducts(data.products)
    }
    fetchProducts()
  }, [])

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="p-3">Image</th>
            <th className="p-3">Title</th>
            <th className="p-3">Description</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="p-3">
                <img
                  src={p.image || "/placeholder.svg?height=48&width=48&query=product"}
                  alt={`${p.title} image`}
                  className="h-12 w-12 rounded object-cover"
                />
              </td>
              <td className="p-3">{p.title}</td>
              <td className="p-3">
                <span className="line-clamp-2 text-foreground/80">{p.description}</span>
              </td>
              <td className="p-3">{p.category}</td>
              <td className="p-3">₹{(p.price / 100).toFixed(2)}</td>
              <td className="p-3">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
