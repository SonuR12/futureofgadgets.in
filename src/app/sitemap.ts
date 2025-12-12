import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://futureofgadgets.in'
  
  const categories = ['laptops', 'desktops', 'monitors', 'keyboards', 'headphones', 'accessories']
  
  const routes = [
    '',
    '/about',
    '/contact',
    '/cart',
    '/catalog',
    '/products',
    '/search',
    '/wishlist',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/refund-policy',
    '/auth/signin',
    '/category',
  ]

  const staticPages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : route === '/about' || route === '/contact' ? 0.9 : 0.8,
  }))

  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Add section pages
  const sectionPages = categories.map((category) => ({
    url: `${baseUrl}/section/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Fetch and add product pages
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${baseUrl}/api/products`, { 
      cache: 'no-store',
      next: { revalidate: 3600 } // Revalidate every hour
    })
    const products = await res.json()
    
    productPages = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.slug || product.id}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  return [...staticPages, ...categoryPages, ...sectionPages, ...productPages]
}
