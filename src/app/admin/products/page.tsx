import type { Metadata } from "next"
import ProductTable from "@/components/admin/product-table"

export const metadata: Metadata = {
  title: "Admin • Products",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin/products" },
}

export default function AdminProductsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Products</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          View inventory, prices, and statuses. This section is hidden from search engines.
        </p>
      </header>
      <ProductTable />
    </main>
  )
}
