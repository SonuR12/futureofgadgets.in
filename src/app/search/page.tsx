import type { Metadata } from "next"
import ProductGrid from "@/components/product-grid"
import { searchProducts } from "@/lib/data/products"

export const metadata: Metadata = {
  title: "Search",
  description: "Search products",
  alternates: { canonical: "/search" },
}

export default function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || ""
  const results = q ? searchProducts(q).filter((p) => p.status === "active") : []
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground text-balance">Search</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">Showing results for: {q || "—"}</p>
      </header>
      {q ? (
        <ProductGrid items={results} />
      ) : (
        <p className="text-muted-foreground">Enter a search query in the URL, e.g., /search?q=watch</p>
      )}
    </main>
  )
}
