'use client'
import React, { useState, useEffect } from 'react'
import ProductCard from '../product-card'
import { toast } from 'sonner'
import { addToCart } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FeaturedSection() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [displayCount, setDisplayCount] = useState(5)

  useEffect(() => {
    const updateCount = () => {
     if (window.innerWidth < 620) setDisplayCount(4);
      else if (window.innerWidth < 1024) setDisplayCount(6);
      else setDisplayCount(8);
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.quantity === 0) {
      toast.error("Out of Stock", {
        description: "This product is currently unavailable."
      })
      return
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image,
      color: product.selectedColor || product.color
    })
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
    ))
    toast.success('', { description: `${product.name} has been added to your cart.` })
  }

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.quantity === 0) {
      toast.error("Out of Stock", {
        description: "This product is currently unavailable."
      })
      return
    }
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image,
      color: product.selectedColor || product.color
    })
    router.push('/cart')
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([settings, allProducts]) => {
      const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]")
      const ids = settings.sectionProducts?.featuredSection || []
      let filteredProducts = ids.length > 0 
        ? allProducts.filter((p: any) => ids.includes(p.id))
        : []
      
      const mappedProducts = filteredProducts.map((p: any) => {
        const cartQty = cart.reduce((sum: number, item: any) => 
          item.id === p.id ? sum + (item.qty || 1) : sum, 0
        )
        return {
          id: p.id,
          slug: p.slug || p.name.toLowerCase().replace(/\s+/g, "-"),
          name: p.name || p.title,
          type: p.category || p.type,
          description: p.description,
          coverImage: p.frontImage,
          frontImage: p.frontImage,
          image: p.image,
          images: p.images || [p.frontImage],
          price: p.price,
          mrp: p.mrp,
          quantity: Math.max(0, (p.quantity || p.stock) - cartQty),
          color: p.color,
          rating: p.rating,
          ratingCount: p.ratingCount
        }
      })
      setProducts(mappedProducts)
    }).catch(() => setProducts([]))
  }, [])

  return (
    <section className="py-6">
     <div className="mx-auto max-w-[1440px]  sm:px-6 lg:px-11">
        {products.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-3 sm:px-0">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 ">Featured Products</h2>
              <Link href="/section/featured" className="sm:px-4 sm:p-2 sm:bg-blue-100 rounded-full text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm whitespace-nowrap hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 sm:gap-1 md:gap-2">
              {products.slice(0, displayCount).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
