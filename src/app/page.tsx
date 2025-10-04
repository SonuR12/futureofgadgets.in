import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data/products";
import { popularProducts } from "@/lib/data/popular-products";
import HeaderSlider from "@/components/home/HomeSlider";
import ProductCard from "@/components/product-card";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Electronic Store - Best Electronics Online Shopping",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Banner */}
      <div className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl sm:px-4 py-0 -mt-1.5 sm:pt-12 sm:pb-6 md:py-4">
          <HeaderSlider />
        </div>
      </div>

      {/* Top Categories */}
      <section className="bg-white dark:bg-gray-800 py-6 mt-1 sm:mt-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Top Categories
            </h2>
            <Link
              href="/category"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-2 sm:gap-4">
            {[...CATEGORIES.filter((c) => c !== "Show All"), "Show All"].map(
              (category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase()}`}
                  className="flex flex-col items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-13 h-13 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">
                      {category === "Laptops"
                        ? "💻"
                        : category === "Laptop Accessories"
                        ? "🎒"
                        : category === "Chargers"
                        ? "🔌"
                        : category === "Keyboards"
                        ? "⌨️"
                        : category === "Mouse"
                        ? "🖱️"
                        : category === "Monitors"
                        ? "🖥️"
                        : category === "Show All"
                        ? "📦"
                        : "📦"}
                    </span>
                  </div>
                  <span className="text-[10px] sm:tsxt-xs text-center text-gray-700 dark:text-gray-300 font-medium ">
                    {category}
                  </span>
                </Link>
              )
            )}
          </div>
        </div>
      </section>

      {/* Deals of the Day */}
      <section className="bg-white dark:bg-gray-800 py-6 mt-1 sm:mt-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Deals of the Day
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>⏰</span>
                <span>22h 15m Left</span>
              </div>
            </div>
            <Link
              href="/products"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="transform transition-all duration-300"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best of Electronics */}
      <section className="bg-white dark:bg-gray-800 py-6 mt-1 sm:mt-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Best of Electronics
            </h2>
            <Link
              href="/products"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularProducts.slice(6, 12).map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-shadow bg-white dark:bg-gray-700"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Offers */}
      <section className="bg-white dark:bg-gray-800 py-6 mt-1 sm:mt-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Top Offers
            </h2>
            <Link
              href="/products"
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="transform transition-all duration-300"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white dark:bg-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 text-blue-500">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Quality Assured
              </h3>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 text-blue-500">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                7 Day Return
              </h3>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 text-blue-500">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Free Delivery
              </h3>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 text-blue-500">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                24x7 Support
              </h3>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
