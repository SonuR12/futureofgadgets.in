'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/product-card'
import { addToCart } from '@/lib/cart'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function SectionPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([settings, allProducts]) => {
      const sectionMap: any = {
        'new-arrivals': { key: 'newArrivals', title: 'New Arrivals' },
        'deal-of-the-day': { key: 'dealOfTheDay', title: 'Deal of the Day' },
        'featured': { key: 'featuredSection', title: 'Featured Products' },
        'best-sellers': { key: 'bestSeller', title: 'Best Sellers' },
        'trending': { key: 'trendingNow', title: 'Trending Now' }
      }
      
      const section = sectionMap[slug]
      if (section) {
        setTitle(section.title)
        if (slug === 'new-arrivals') {
          setProducts(allProducts.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
        } else if (slug === 'trending') {
          const trending = allProducts
            .filter((p: any) => p.mrp && p.mrp > p.price)
            .sort((a: any, b: any) => {
              const discountA = ((a.mrp - a.price) / a.mrp) * 100
              const discountB = ((b.mrp - b.price) / b.mrp) * 100
              return discountB - discountA
            })
          setProducts(trending)
        } else {
          const ids = settings.sectionProducts?.[section.key] || []
          if (ids.length > 0) {
            setProducts(allProducts.filter((p: any) => ids.includes(p.id)))
          }
        }
      }
    }).finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image
    })
    toast.success('', { description: `${product.name} has been added to your cart.` })
  }

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.frontImage || product.image
    })
    router.push('/cart')
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-8 pb-3 py-2">
      <div className="max-w-7xl mx-auto">
        
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 mx-auto px-4 sm:px-0">{title}</h1>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 sm:gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 sm:gap-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this section</p>
          </div>
        )}
      </div>
    </main>
  )
}
