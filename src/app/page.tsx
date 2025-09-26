import type { Metadata } from "next"
import Link from "next/link"
import { products } from "@/lib/data/products"

export const metadata: Metadata = {
  title: "Home",
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-balance text-3xl font-semibold text-foreground">Welcome to Storefront</h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Your one-stop destination for curated products. Enjoy secure checkout, fast delivery, and excellent support.
        </p>
      </header>

      <section aria-labelledby="featured" className="mb-10">
        <h2 id="featured" className="text-pretty text-xl font-semibold text-foreground">
          Featured Products
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {products
            .filter((p) => p.status === "active")
            .slice(0, 3)
            .map((p) => (
              <article key={p.id} className="rounded-lg border p-4">
                <Link href={`/products/${p.slug}`} className="block">
                  <img
                    src={`${p.image}?height=200&width=320&query=featured-product`}
                    alt={`${p.name} image`}
                    className="h-40 w-full rounded-md border bg-card object-cover"
                  />
                  <h3 className="mt-3 text-foreground font-medium hover:underline">{p.name}</h3>
                </Link>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
                <div className="mt-2 font-semibold text-foreground">${p.price.toFixed(2)}</div>
              </article>
            ))}
        </div>
        <div className="mt-4">
          <Link href="/catalog" className="underline">
            Browse full catalog
          </Link>
        </div>
      </section>

      <section aria-labelledby="why" className="mb-10">
        <h2 id="why" className="text-pretty text-xl font-semibold text-foreground">
          Why Shop With Us
        </h2>
        <ul className="mt-3 list-disc pl-5 text-muted-foreground leading-relaxed">
          <li>Curated catalog with honest pricing</li>
          <li>Fast, tracked shipping</li>
          <li>Secure payments and easy returns</li>
        </ul>
      </section>
    </main>
  )
}
