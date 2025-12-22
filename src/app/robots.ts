import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://futureofgadgets.in'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products/', '/category/', '/about', '/contact', '/catalog', '/api/product-feed'],
        disallow: ['/api/', '/admin/', '/profile/', '/orders/', '/checkout/', '/auth/', '/wishlist'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/products/', '/category/', '/about', '/contact', '/catalog', '/search', '/api/product-feed'],
        disallow: ['/api/', '/admin/', '/profile/', '/orders/', '/checkout/', '/wishlist'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/products/', '/category/', '/about', '/contact', '/catalog', '/api/product-feed'],
        disallow: ['/api/', '/admin/', '/profile/', '/orders/', '/checkout/', '/auth/', '/wishlist'],
        crawlDelay: 2,
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/api/product-feed`],
    host: baseUrl,
  }
}
