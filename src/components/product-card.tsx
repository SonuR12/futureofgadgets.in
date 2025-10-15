"use client";

import Link from "next/link";
import Image from "next/image";
import { Share2, Copy, X, Heart, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";

type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  coverImage?: string;
  frontImage?: string;
  image?: string;
  price: number;
  mrp?: number;
  quantity?: number;
  stock?: number;
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: (e: React.MouseEvent, product: any) => void;
  onBuyNow?: (e: React.MouseEvent, product: any) => void;
};

export default function ProductCard({ product, onAddToCart, onBuyNow }: ProductCardProps) {
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    setIsWished(isInWishlist(product.id));
    const onUpdate = () => setIsWished(isInWishlist(product.id));
    window.addEventListener('wishlist-updated', onUpdate);
    return () => window.removeEventListener('wishlist-updated', onUpdate);
  }, [product.id]);
  const imageUrl = product.coverImage || product.frontImage || product.image || "/placeholder.svg";
  const currentQty = Number(product.quantity ?? product.stock ?? 0);
  const mrp = Number(product.mrp) || 0;
  const price = Number(product.price) || 0;
  const discountPct = mrp > 0 && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/products/${shareProduct?.slug}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => toast.success("Link copied!"))
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (url: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success("Link copied!");
    } catch (err) {
      toast.error("Failed to copy");
    }
    document.body.removeChild(textArea);
  };

  return (
    <>
      <div className="bg-gray-50 border sm:rounded-sm transition-shadow duration-200 flex flex-col sm:mt-1 relative overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block">
          {discountPct > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
              {discountPct}% OFF
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const added = toggleWishlist({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: imageUrl,
                description: product.description || 'High-quality product with premium features',
              });
              toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
            }}
            className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} />
          </button>
          <div className="relative aspect-[4/3] bg-white p-8 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <Image
                src={imageUrl}
                alt={product.name}
                width={300}
                height={225}
                className="object-contain max-w-full max-h-full"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            {currentQty === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-600 text-white px-4 py-2 font-bold text-sm">OUT OF STOCK</span>
              </div>
            )}
          </div>
        </Link>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start sm:mb-2">
            <Link href={`/products/${product.slug}`} className="flex-1">
              <h3 className="text-base font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 leading-snug">
                {product.name}
              </h3>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShareProduct(product);
              }}
              className="ml-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              title="Share product"
            >
              <Share2 className="h-4 w-4 text-gray-600"/>
            </button>
          </div>
          <Link href={`/products/${product.slug}`} className="flex-1">
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2">
              {product.description || 'High-quality product with premium features'}
            </p>
          </Link>
          
          <Link href={`/products/${product.slug}`} className="flex-1">
          <div className="mb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-baseline sm:gap-2 sm:mb-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{price.toLocaleString()}
              </span>
              {mrp > 0 && mrp > price && (
                <span className="space-x-2">
                  <span className="text-sm text-gray-400 line-through">
                    ₹{mrp.toLocaleString()}
                  </span>
                  <span className="text-sm text-green-600 font-semibold">
                    {discountPct}% off
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-green-600 font-medium">★★★★☆</span>
              <span className="text-xs text-gray-500">(4.2)</span>
            </div>
          </div>
          </Link>

          {onAddToCart && onBuyNow && (
<><div className="sm:hidden flex items-center text-sm text-orange-600"><span> Buy now 
  </span><ChevronRight className="h-4 -left-4"/></div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={(e) => onAddToCart(e, product)}
                disabled={currentQty === 0}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500  text-gray-900 font-bold py-2 text-[10px] lg:text-[12px] xl:text-sm transition-all rounded-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                ADD TO CART
              </button>
              <button
                onClick={(e) => onBuyNow(e, product)}
                disabled={currentQty === 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 text-[10px] lg:text-[12px] xl:text-sm lg:text-sm transition-all rounded-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                BUY NOW
              </button>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Share Popup */}
      {shareProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShareProduct(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Product</h3>
              <button onClick={() => setShareProduct(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mb-4">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/products/${shareProduct.slug}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareProduct.name + ' - ' + url)}`, '_blank');
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/products/${shareProduct.slug}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Facebook</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/products/${shareProduct.slug}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareProduct.name)}&url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Twitter</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/products/${shareProduct.slug}`;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">LinkedIn</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/products/${shareProduct.slug}`;
                  window.open(`https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareProduct.name)}`, '_blank');
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Telegram</span>
              </button>

              {navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: shareProduct.name,
                      text: shareProduct.description,
                      url: `${window.location.origin}/products/${shareProduct.slug}`
                    }).catch(() => {});
                  }}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">More</span>
                </button>
              )}

              <button
                onClick={() => {
                  const url = `${window.location.origin}/products/${shareProduct.slug}`;
                  const subject = encodeURIComponent(shareProduct.name);
                  const body = encodeURIComponent(`Check out this product: ${shareProduct.name}\n\n${url}`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium">Email</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Copy className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium">Copy Link</span>
              </button>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/products/${shareProduct.slug}`}
                className="flex-1 px-3 py-2 border rounded text-sm bg-gray-50"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
