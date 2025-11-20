'use client'
import React, { useState, useEffect } from 'react'
import ProductCard from '../product-card'
import Link from 'next/link';
import { toast } from 'sonner';
import { addToCart } from '@/lib/cart';
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  coverImage: string;
  images: string[];
  price: number;
  mrp?: number;
  quantity: number;
  rating?: number;
  ratingCount?: number;
};

export default function NewArrivals(){
  const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 640) setDisplayCount(4);
      else if (window.innerWidth < 768) setDisplayCount(6);
      else if (window.innerWidth < 1024) setDisplayCount(8);
      else setDisplayCount(10);
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.quantity === 0) {
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
      image: product.coverImage,
      color: product.selectedColor || product.color
    });
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
    ));
    toast.success("", {
      description: `${product.name} has been added to your cart.`
    });
  };

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.quantity === 0) {
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
      image: product.coverImage,
      color: product.selectedColor || product.color
    });
    router.push("/cart");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]");
        const now = new Date().getTime();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        
        const mappedProducts = data
          .filter((p: any) => {
            const updatedAt = new Date(p.updatedAt || p.createdAt || 0).getTime();
            return updatedAt >= thirtyDaysAgo;
          })
          .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
          .map((p: any) => {
            const cartQty = cart.reduce((sum: number, item: any) => 
              item.id === p.id ? sum + (item.qty || 1) : sum, 0
            );
            return {
              id: p.id,
              slug: p.slug || p.name.toLowerCase().replace(/\s+/g, "-"),
              name: p.name || p.title,
              type: p.category || p.type,
              description: p.description,
              coverImage: p.frontImage,
              images: p.images || [p.frontImage],
              price: p.price,
              mrp: p.mrp,
              quantity: Math.max(0, (p.quantity || p.stock) - cartQty),
              color: p.color,
              rating: p.rating,
              ratingCount: p.ratingCount
            };
          });
        setProducts(mappedProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1440px] sm:px-6 lg:px-11">
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-3 xl:px-0">
          <div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 ">New Arrivals</h2>
            <p className="hidden sm:block sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Fresh products just In</p>
          </div>
          <Link href="/section/new-arrivals" scroll={true} className="sm:px-4 sm:p-2 sm:bg-blue-100 rounded-full text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap hover:underline">View All </Link>
        </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 sm:gap-1 md:gap-2">
          {loading ? (
            Array.from({ length: displayCount }).map((_, i) => (
              <div key={i} className="bg-white rounded-sm p-4 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            products.slice(0, displayCount).map((product) => (
              <ProductCard key={product.id} product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
