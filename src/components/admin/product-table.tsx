"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Product = {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
  status: "active" | "draft" | "archived"
  category: string
  image: string
  updatedAt: string
}

export default function ProductTable() {
  const [data, setData] = useState<Product[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((products) => {
        setData(products)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    )
  }, [data, query])

  if (error) {
    return <p className="text-sm text-destructive">Failed to load products.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, SKU, or category"
          aria-label="Search products"
        />
        <Button variant="secondary" onClick={() => setQuery("")}>
          Clear
        </Button>
      </div>

      <Table>
        <TableCaption>Inventory overview. Low-stock items are highlighted.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="text-sm text-muted-foreground">
                Loading products...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-sm text-muted-foreground">
                No products found.
              </TableCell>
            </TableRow>
          )}
          {filtered.map((p) => {
            const lowStock = p.quantity <= 5
            return (
              <TableRow key={p.id} className={lowStock ? "bg-muted/40" : undefined}>
                <TableCell className="min-w-52">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image || "/placeholder.svg"}
                      alt={`${p.name} image`}
                      className="h-12 w-12 rounded-md border object-cover"
                    />
                    <div>
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        ID: {p.id.slice(0, 8)} • Updated: {new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell className="text-right text-foreground">${p.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={lowStock ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {p.quantity}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" aria-label={`Edit ${p.name}`}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" aria-label={`Delete ${p.name}`}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
