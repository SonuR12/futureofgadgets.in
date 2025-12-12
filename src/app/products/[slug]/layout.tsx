import { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://futureofgadgets.in'
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' })
    const products = await res.json()
    
    const product = products.find((p: any) => 
      p.slug === slug || 
      p.id === slug ||
      p.name.toLowerCase().replace(/\s+/g, '-') === slug
    )
    
    if (product) {
      const imageUrl = product.frontImage || product.image || product.coverImage
      const fullImageUrl = imageUrl?.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl || '/logo.png'}`
      const description = product.description?.substring(0, 160) || `Buy ${product.name} at best price. High-quality electronics and gadgets with warranty.`
      const price = product.price || 0
      const mrp = product.mrp || price
      const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
      
      const seoTitle = `${product.name} - ₹${price.toLocaleString()} ${discount > 0 ? `(${discount}% Off)` : ''} | Future of Gadgets`
      
      return {
        title: seoTitle,
        description,
        keywords: [
          product.name,
          product.brand || 'electronics',
          product.category || 'gadgets',
          'buy online',
          'best price',
          'warranty',
          'free delivery',
          'India'
        ].join(', '),
        authors: [{ name: 'Future of Gadgets' }],
        creator: 'Future of Gadgets',
        publisher: 'Future of Gadgets',
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
        openGraph: {
          title: seoTitle,
          description,
          images: [{
            url: fullImageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          }],
          url: `${baseUrl}/products/${slug}`,
          type: 'website',
          siteName: 'Future of Gadgets',
          locale: 'en_IN',
        },
        twitter: {
          card: 'summary_large_image',
          title: seoTitle,
          description,
          images: [fullImageUrl],
          creator: '@futureofgadgets',
        },
        alternates: {
          canonical: `${baseUrl}/products/${slug}`,
        },
        other: {
          'product:price:amount': price.toString(),
          'product:price:currency': 'INR',
          'product:availability': product.quantity > 0 ? 'in stock' : 'out of stock',
          'product:brand': product.brand || '',
          'product:category': product.category || '',
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }
  
  return {
    title: 'Product - Future of Gadgets',
    description: 'Shop quality electronics and gadgets with warranty and free delivery',
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
