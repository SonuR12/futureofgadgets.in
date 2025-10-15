"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/product-card";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CategorySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]");
        
        const filtered = data.filter(
          (product: any) => product.category?.toLowerCase() === slug.toLowerCase()
        ).map((p: any) => {
          const cartQty = cart.reduce((sum: number, item: any) => 
            item.id === p.id ? sum + (item.qty || 1) : sum, 0
          );
          return {
            ...p,
            quantity: Math.max(0, (p.quantity || p.stock || 0) - cartQty)
          };
        });
        
        setProducts(filtered);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.quantity === 0) {
      toast.error("Out of Stock");
      return;
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image,
    });
    toast.success("Added to cart");
  };

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.quantity === 0) {
      toast.error("Out of Stock");
      return;
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image,
    });
    router.push("/cart");
  };

  const sortProducts = (products: any[]) => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const sortedProducts = sortProducts(products);
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="w-full mx-auto sm:px-4">
        <div className="mb-6 px-4 flex items-center justify-between">
          <div className="">
            <h1 className="text-2xl font-bold">{categoryName}</h1>
            <p className="text-gray-600 text-sm mt-1">{products.length} products</p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 sm:w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sort by</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
    {products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    ))}
  </div>


        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Check back later</p>
            <button
              onClick={() => router.push("/category")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
