"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import ProductCardWithShare from "@/components/ProductCardWithShare";

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
  frontImage?: string;
  brand?: string;
  rating?: number;
  quantity?: number;
  stock?: number;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  const sortProducts = (products: Product[], sortType: string) => {
    const sorted = [...products];
    switch (sortType) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = product.quantity !== undefined ? product.quantity : (product.stock || 0);
    if (currentQty <= 0) {
      toast.error("Out of Stock", {
        description: "This product is currently unavailable."
      });
      return;
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image || ""
    });
    setResults(results.map(p => {
      if (p.id === product.id) {
        const newQty = (p.quantity !== undefined ? p.quantity : (p.stock || 0)) - 1;
        return { ...p, quantity: Math.max(0, newQty) };
      }
      return p;
    }));
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart.`
    });
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = product.quantity !== undefined ? product.quantity : (product.stock || 0);
    if (currentQty <= 0) {
      toast.error("Out of Stock", {
        description: "This product is currently unavailable."
      });
      return;
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image || ""
    });
    router.push("/cart");
  };

  // Update query when URL changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const searchProducts = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setResults([]);
    setSuggestions([]);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]");
      const mappedResults = data.map((p: any) => {
        const cartQty = cart.reduce((sum: number, item: any) => 
          item.id === p.id ? sum + (item.qty || 1) : sum, 0
        );
        return {
          ...p,
          quantity: Math.max(0, (p.quantity || p.stock || 0) - cartQty)
        };
      });
      setResults(mappedResults);
      
      // Fetch suggestions - always show related products
      const suggestResponse = await fetch(`/api/products?limit=8`);
      const suggestData = await suggestResponse.json();
      const resultIds = new Set(mappedResults.map((p: any) => p.id));
      const mappedSuggestions = suggestData
        .filter((p: any) => !resultIds.has(p.id))
        .map((p: any) => {
          const cartQty = cart.reduce((sum: number, item: any) => 
            item.id === p.id ? sum + (item.qty || 1) : sum, 0
          );
          return {
            ...p,
            quantity: Math.max(0, (p.quantity || p.stock || 0) - cartQty)
          };
        });
      setSuggestions(mappedSuggestions);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSuggestions([]);
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
    if (query.trim()) {
      searchProducts(query);
    }
  };

  // Real-time search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && query !== initialQuery) {
        searchProducts(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, initialQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {query && !loading && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
                <p className="text-gray-600">{results.length} products found for <span className="font-semibold">&quot;{query}&quot;</span></p>
              </div>
              {results.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-fit sm:w-auto">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                      Name: A to Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                      Name: Z to A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Searching products...</p>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortProducts(results, sortBy).map((product) => (
              <ProductCardWithShare
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}

                {query && !loading && results.length === 0 && (
          <>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  No results found for &quot;{query}&quot;
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any products matching your search. Try different keywords or browse our categories.
                </p>
                <Link href="/products" className="inline-block px-8 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors">
                  Browse All Products
                </Link>
              </div>
            </div>

          </>
        )}

        {query && !loading && suggestions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{results.length === 0 ? 'You might also like' : 'Related Products'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {suggestions.map((product) => (
                <ProductCardWithShare
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    // <Suspense>
      <SearchContent />
    // </Suspense>
  );
}