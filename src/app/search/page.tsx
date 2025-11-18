"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import ProductCard from "@/components/product-card";

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
    toast.success("", {
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {query && !loading && (
          <div className="pb-4 pt-8 sm:pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
                  Search Results
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                  {results.length} {results.length === 1 ? 'product' : 'products'} found for <span className="font-medium">&quot;{query}&quot;</span>
                </p>
              </div>
              {results.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 text-sm">
                      <ArrowUpDown className="h-3 w-3 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => setSortBy("relevance")} className="text-sm">
                      Relevance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-asc")} className="text-sm">
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("price-desc")} className="text-sm">
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("name-asc")} className="text-sm">
                      Name: A to Z
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("name-desc")} className="text-sm">
                      Name: Z to A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="py-6 sm:py-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-50 border sm:rounded-sm transition-shadow duration-200 flex flex-col sm:mt-1 relative overflow-hidden">
                  {/* Image skeleton - matches aspect-[4/3] */}
                  <div className="relative aspect-[4/3] bg-white p-8 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <div className="w-full h-full bg-gray-200 shimmer rounded"></div>
                    </div>
                  </div>
                  
                  {/* Content skeleton - matches p-4 structure */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Title skeleton - matches h3 with line-clamp-2 */}
                    <div className="flex justify-between items-start sm:mb-2">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 shimmer rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 shimmer rounded w-3/4"></div>
                      </div>
                      <div className="ml-2 w-6 h-6 bg-gray-200 shimmer rounded-full"></div>
                    </div>
                    
                    {/* Description skeleton - matches p with line-clamp-2 */}
                    <div className="mb-2">
                      <div className="h-3 bg-gray-200 shimmer rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 shimmer rounded w-5/6"></div>
                    </div>
                    
                    {/* Price section skeleton */}
                    <div className="mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 items-baseline sm:gap-2 sm:mb-1">
                        <div className="h-6 bg-gray-200 shimmer rounded w-20"></div>
                        <div className="flex space-x-2">
                          <div className="h-3 bg-gray-200 shimmer rounded w-12"></div>
                          <div className="h-3 bg-gray-200 shimmer rounded w-10"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-3 bg-gray-200 shimmer rounded w-16"></div>
                        <div className="h-3 bg-gray-200 shimmer rounded w-8"></div>
                      </div>
                    </div>
                    
                    {/* Buy now link skeleton */}
                    <div className="h-4 bg-gray-200 shimmer rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="py-6 sm:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {sortProducts(results, sortBy).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="py-12 sm:py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ArrowUpDown className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                No results found
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
                We couldn&apos;t find any products matching &quot;{query}&quot;. Try different keywords.
              </p>
              <Link 
                href="/products/" 
                className="inline-flex items-center justify-center px-3 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-xs sm:text-base font-medium rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}

        {query && !loading && suggestions.length > 0 && (
          <div className="border-t border-gray-200 pt-6 sm:pt-8">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {results.length === 0 ? 'You might also like' : 'Related Products'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {suggestions.slice(0, 8).map((product) => (
                <ProductCard
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