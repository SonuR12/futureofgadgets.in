import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://futureofgadgets.in';
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Future of Gadgets - Product Feed</title>
    <link>${baseUrl}</link>
    <description>Latest electronics and tech products</description>
    ${products.map(product => {
      const imageUrl = product.frontImage?.startsWith('http') 
        ? product.frontImage 
        : `${baseUrl}${product.frontImage || '/logo.png'}`;
      
      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description || `Buy ${product.name} at best price with warranty`}]]></g:description>
      <g:link>${baseUrl}/products/${product.slug}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${(product.stock || product.quantity || 0) > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${product.price} INR</g:price>
      <g:brand><![CDATA[${product.brand || 'Future of Gadgets'}]]></g:brand>
      <g:product_category><![CDATA[${product.category}]]></g:product_category>
      <g:google_product_category>Electronics</g:google_product_category>
      <g:gtin>${product.sku || product.id}</g:gtin>
      <g:mpn>${product.sku || product.id}</g:mpn>
      <g:shipping_weight>1 kg</g:shipping_weight>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0 INR</g:price>
      </g:shipping>
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Product feed error:', error);
    return NextResponse.json({ error: 'Failed to generate product feed' }, { status: 500 });
  }
}