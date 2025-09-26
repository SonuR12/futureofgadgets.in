import type { Metadata } from "next"
import { products } from "@/lib/data/products"
import ProductGrid from "@/components/product-grid"
import { notFound } from "next/navigation"

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const exists = products.some((p) => p.category.toLowerCase() === params.slug.toLowerCase())
  if (!exists) return { title: "Category Not Found" }
  const title = `${params.slug} • Category`
  return {
    title,
    description: `Browse products in ${params.slug}`,
    alternates: { canonical: `/category/${params.slug}` },
  }
}

export default function CategoryPage({ params }: { params: Params }) {
  const list = products.filter((p) => p.category.toLowerCase() === params.slug.toLowerCase() && p.status === "active")
  if (list.length === 0) notFound()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground text-balance">{params.slug}</h1>
      </header>
      <ProductGrid items={list} />
    </main>
  )
}
