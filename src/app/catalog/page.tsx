import type { Metadata } from "next"
import ProductGrid from "@/components/product-grid"
import { products, getCategories } from "@/lib/data/products"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Catalog",
  description: "Explore our full catalog of products across categories.",
  alternates: { canonical: "/catalog" },
}

export default function CatalogPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: "price-asc" | "price-desc" }
}) {
  const categories = getCategories()
  let list = [...products].filter((p) => p.status === "active")
  if (searchParams.category) list = list.filter((p) => p.category === searchParams.category)
  if (searchParams.sort === "price-asc") list.sort((a, b) => a.price - b.price)
  if (searchParams.sort === "price-desc") list.sort((a, b) => b.price - a.price)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground text-balance">Catalog</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Browse our selection. Use filters to narrow your search.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Categories:</span>
        <Link href="/catalog" className="text-sm underline">
          All
        </Link>
        {categories.map((c) => (
          <Link key={c} href={`/catalog?category=${encodeURIComponent(c)}`} className="text-sm underline">
            {c}
          </Link>
        ))}
        <span className="mx-3 h-4 w-px bg-border" aria-hidden />
        <span className="text-sm text-muted-foreground">Sort:</span>
        <Link
          href={`/catalog?${searchParams.category ? `category=${encodeURIComponent(searchParams.category)}&` : ""}sort=price-asc`}
          className="text-sm underline"
        >
          Price ↑
        </Link>
        <Link
          href={`/catalog?${searchParams.category ? `category=${encodeURIComponent(searchParams.category)}&` : ""}sort=price-desc`}
          className="text-sm underline"
        >
          Price ↓
        </Link>
      </div>

      <ProductGrid items={list} />
    </main>
  )
}
