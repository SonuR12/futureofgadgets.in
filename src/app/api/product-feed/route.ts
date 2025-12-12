import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://futureofgadgets.in';
    
    // Fetch products from your API
    const res = await fetch(`${baseUrl}/api/products`, { 
      cache: 'no-store' 
    });
    const products = await res.json();

    // Generate RSS/XML feed for Google Shopping
    const rssItems = products.map((product: any) => {
      const imageUrl = product.frontImage || product.image || product.coverImage;
      const fullImageUrl = imageUrl?.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl || '/logo.png'}`;
      const price = product.price || 0;
      const availability = product.quantity > 0 ? 'in stock' : 'out of stock';
      
      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || `Buy ${product.name} at best price with warranty`}]]></g:description>
      <g:link>${baseUrl}/products/${product.slug || product.id}</g:link>
      <g:image_link>${fullImageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand><![CDATA[${product.brand || 'Future of Gadgets'}]]></g:brand>
      <g:product_type><![CDATA[${product.category || 'Electronics'}]]></g:product_type>
      <g:google_product_category>Electronics</g:google_product_category>
      <g:gtin>${product.sku || product.id}</g:gtin>
      <g:mpn>${product.sku || product.id}</g:mpn>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
    </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Future of Gadgets - Product Feed</title>
    <link>${baseUrl}</link>
    <description>Electronics and gadgets at best prices with warranty</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating product feed:', error);
    return NextResponse.json({ error: 'Failed to generate product feed' }, { status: 500 });
  }
}