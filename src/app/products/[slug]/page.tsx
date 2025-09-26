import type { Metadata } from "next"
import ProductDetailPageClient from "./ProductDetailPageClient"
import { getProductBySlug } from "@/lib/data/products"

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProductBySlug(params.slug)
  if (!p) return { title: "Product Not Found" }
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      type: "product",
      title: p.name,
      description: p.description,
      images: [{ url: p.image }],
    },
  }
}

export default function ProductDetailPage({ params }: { params: Params }) {
  const product = getProductBySlug(params.slug)
  return <ProductDetailPageClient product={product} />
}
