import type { Metadata } from "next"
import Link from "next/link"
import { products } from "@/lib/data/products"
import HeaderSlider from "@/components/home/HomeSlider"

export const metadata: Metadata = {
  title: "Home",
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <HeaderSlider/>
    </main>
  )
}
