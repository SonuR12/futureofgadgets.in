"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Zap, ArrowUpDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";

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
      image: product.frontImage || product.image
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
      image: product.frontImage || product.image
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
      return;
    }

    setLoading(true);
    setResults([]);
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
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Searching products...</p>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sortProducts(results, sortBy).map((product) => (
              <div key={product.id} className="bg-white rounded-sm hover:bg-gray-100 transition-shadow duration-200 flex flex-col">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.frontImage || product.image || '/no-image.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    {((product.quantity !== undefined ? product.quantity : (product.stock || 0)) <= 0) && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 font-bold text-sm">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4 flex-1 flex flex-col">
                  <Link href={`/products/${product.slug}`} className="flex-1">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-blue-600 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {product.description || 'High-quality product with premium features'}
                    </p>
                  </Link>
                  
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{product.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-green-600 font-medium">★★★★☆</span>
                      <span className="text-xs text-gray-500">(4.2)</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={(product.quantity !== undefined ? product.quantity : (product.stock || 0)) <= 0}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      ADD TO CART
                    </button>
                    <button
                      onClick={(e) => handleBuyNow(e, product)}
                      disabled={(product.quantity !== undefined ? product.quantity : (product.stock || 0)) <= 0}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center">
              <div className="text-7xl mb-6">🔍</div>
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
        )}
      </div>
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