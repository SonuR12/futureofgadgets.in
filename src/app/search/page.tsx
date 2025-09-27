"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  description: string;
  price: number;
  mrp?: number;
  image: string;
  brand?: string;
  rating?: number;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const results = await response.json();
      setResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      searchProducts(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts(query);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Products</h1>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p>Searching...</p>
        </div>
      )}

      {query && !loading && (
        <div className="mb-4">
          <p className="text-muted-foreground">
            {results.length} results for &quot;{query}&quot;
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.mrp.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.brand && (
                  <span className="text-sm text-blue-600">{product.brand}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {query && !loading && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            No products found for &quot;{query}&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Try searching for different keywords or browse our categories
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8"><p>Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}