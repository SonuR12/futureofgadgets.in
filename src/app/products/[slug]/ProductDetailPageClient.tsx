"use client"

import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { addToCart } from "@/lib/cart"

type Product = {
  id: string
  slug: string
  name: string
  description: string
  image: string
  price: number
  mrp?: number
  quantity: number
  sku: string
  brand?: string
  rating?: number
}

type Props = {
  product: Product | null
}

export default function ProductDetailPageClient({ product }: Props) {
  if (!product) notFound()

  const offer = {
    "@type": "Offer",
    priceCurrency: "USD",
    price: product.price.toFixed(2),
    availability: product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: [product.image],
            description: product.description,
            sku: product.sku,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            aggregateRating: product.rating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: 120,
                }
              : undefined,
            offers: offer,
          }),
        }}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <img
            src={`${product.image}?height=420&width=560&query=product-detail`}
            alt={`${product.name} main image`}
            className="w-full rounded-lg border object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-foreground text-pretty">{product.name}</h1>
          <div className="text-muted-foreground">{product.brand}</div>
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-foreground">${product.price.toFixed(2)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-muted-foreground line-through">${product.mrp.toFixed(2)}</span>
            )}
          </div>
          <div className="text-sm">{product.quantity > 0 ? "In stock" : "Out of stock"}</div>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                addToCart({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              disabled={product.quantity <= 0}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
