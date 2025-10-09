"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { toast } from "sonner";
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw, CreditCard, Check, ChevronRight, Package, Award, Zap, Headphones, Copy, X } from "lucide-react";
import Loading from "@/app/loading";

type Product = {
  id: string;
  slug: string;
  name: string;
  title: string;
  sku?: string;
  description: string;
  price: number;
  mrp?: number;
  quantity: number;
  stock: number;
  status: string;
  category: string;
  brand?: string;
  rating?: number;
  image: string;
  frontImage?: string;
  images?: string[];
  coverImage?: string;
  updatedAt: string;
  screenSize?: string;
  hardDiskSize?: string;
  cpuModel?: string;
  ramMemory?: string;
  operatingSystem?: string;
  graphics?: string;
};

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.quantity === 0) {
      toast.error("Out of Stock", {
        description: "This product is currently unavailable.",
      });
      return;
    }
    
    if (quantity > product.quantity) {
      toast.error("Insufficient Stock", {
        description: `Only ${product.quantity} items available.`,
      });
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.frontImage || product.image || product.coverImage || "/no-image.svg"
      });
    }
    
    setProduct({ ...product, quantity: product.quantity - quantity });
    setQuantity(1);
    
    toast.success("Added to Cart", {
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.quantity === 0) {
      toast.error("Out of Stock", {
        description: "This product is currently unavailable.",
      });
      return;
    }
    
    if (quantity > product.quantity) {
      toast.error("Insufficient Stock", {
        description: `Only ${product.quantity} items available.`,
      });
      return;
    }
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.frontImage || product.image || product.coverImage || "/no-image.svg"
      });
    }
    
    setProduct({ ...product, quantity: product.quantity - quantity });
    
    router.push("/cart");
  };

  // const handleWishlist = () => {
  //   toast.success("Added to Wishlist", {
  //     description: `${product?.name} has been added to your wishlist.`,
  //   });
  // };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  useEffect(() => {
    if (!slug) return;

    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        const found = products.find((p: any) => 
          p.slug === slug || 
          p.id === slug ||
          p.name.toLowerCase().replace(/\s+/g, "-") === slug
        );
        
        if (found) {
          const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]")
          const cartQty = cart.reduce((sum: number, item: any) => 
            item.id === found.id ? sum + (item.qty || 1) : sum, 0
          )
          found.quantity = Math.max(0, found.quantity - cartQty)
        }
        
        setProduct(found || null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
   <Loading/>
  );
  
  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  const allImages = [];
  if (product.frontImage) allImages.push(product.frontImage);
  if (product.images && product.images.length > 0) allImages.push(...product.images);
  if (product.image && !allImages.includes(product.image)) allImages.push(product.image);
  if (product.coverImage && !allImages.includes(product.coverImage)) allImages.push(product.coverImage);
  
  const images = allImages.length > 0 ? allImages : ["/no-image.svg"];
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-lg px-4 py-3 mb-6 shadow-sm ">
          <div className="text-sm text-gray-600 flex items-center flex-wrap">
            <span className="hover:text-blue-600 cursor-pointer hover:underline transition-colors" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="hover:text-blue-600 cursor-pointer hover:underline transition-colors" onClick={() => router.push(`/category/${product.category.toLowerCase()}`)}>{product.category}</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Images */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm h-fit sticky top-24">
            <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden border border-gray-200 relative group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                  {discount}% OFF
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Action Icons */}
            <div className="flex gap-3 mt-4">
              {/* <button onClick={handleWishlist} className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2 transition-all font-medium">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Wishlist</span>
              </button> */}
              <button onClick={handleShare} className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center gap-2 transition-all font-medium">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              </div>
              
              {product.brand && (
                <p className="text-gray-600 mb-3">Brand: <span className="text-blue-600 font-medium">{product.brand}</span></p>
              )}

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm">
                    <span>{product.rating}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-sm text-gray-600">2,345 ratings</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <span className="text-lg text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
                      <span className="text-green-600 font-semibold">{discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Stock Status & Quantity */}
              <div className="mb-6 space-y-4">
                <div>
                  {product.quantity === 0 ? (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      Out of Stock
                    </span>
                  ) : product.quantity <= 5 ? (
                    <span className="text-orange-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                      Only {product.quantity} left in stock - Order soon!
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      In Stock - Ready to Ship
                    </span>
                  )}
                </div>
                
                {product.quantity > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 border-x border-gray-300 min-w-[50px] text-center font-medium">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              {product.quantity === 0 ? (
                <div className="mb-6">
                  <div className="py-3.5 bg-gray-100 border-2 border-gray-400 text-gray-600 font-bold rounded-lg flex items-center justify-center gap-2">
                    <X className="w-5 h-5" />
                    OUT OF STOCK
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 mb-6">
                  <button 
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    ADD TO CART
                  </button>
                  <button 
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    BUY NOW
                  </button>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Free Delivery</div>
                    <div className="text-xs text-gray-600">On orders above ₹500</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">7 Days Return</div>
                    <div className="text-xs text-gray-600">Easy return policy</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">1 Year Warranty</div>
                    <div className="text-xs text-gray-600">Manufacturer warranty</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="text-xs text-gray-600">Pay on delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Offers */}
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-green-100">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-lg text-gray-900">Available Offers</h3>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600 font-bold text-lg">%</span>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">Bank Offer</div>
                    <div className="text-gray-600">10% instant discount on SBI Credit Cards, up to ₹1,500</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-bold text-lg">₹</span>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">No Cost EMI</div>
                    <div className="text-gray-600">Starting from ₹{Math.round(product.price / 12)}/month on all major credit cards</div>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-600 font-bold text-lg">🎁</span>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">Partner Offer</div>
                    <div className="text-gray-600">Get extra ₹500 off on exchange of old products</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Why Buy */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-gray-900">Why Buy This?</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Genuine Product</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specifications */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
            
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2"><span className="text-green-600">✓</span> High-quality build with premium materials for durability</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Latest technology with advanced features and performance</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Energy efficient design that saves power and reduces costs</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Easy to use interface with intuitive controls</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Sleek and modern design that fits any workspace</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Reliable performance with consistent quality output</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Compatible with multiple devices and platforms</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Low maintenance with easy cleaning and care</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3 mt-6">What&apos;s in the Box</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex gap-2"><span className="text-blue-600">•</span> 1 x {product.name}</li>
              <li className="flex gap-2"><span className="text-blue-600">•</span> 1 x User Manual</li>
              <li className="flex gap-2"><span className="text-blue-600">•</span> 1 x Warranty Card</li>
              <li className="flex gap-2"><span className="text-blue-600">•</span> 1 x Power Cable (if applicable)</li>
            </ul>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <div className="space-y-3 text-sm">
              {product.brand && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium text-right">{product.brand}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Model Name</span>
                <span className="font-medium text-right">{product.name}</span>
              </div>
              {product.screenSize && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Screen Size</span>
                  <span className="font-medium text-right">{product.screenSize}</span>
                </div>
              )}
              {product.cpuModel && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Processor</span>
                  <span className="font-medium text-right">{product.cpuModel}</span>
                </div>
              )}
              {product.ramMemory && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">RAM</span>
                  <span className="font-medium text-right">{product.ramMemory}</span>
                </div>
              )}
              {product.hardDiskSize && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium text-right">{product.hardDiskSize}</span>
                </div>
              )}
              {product.graphics && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Graphics</span>
                  <span className="font-medium text-right">{product.graphics}</span>
                </div>
              )}
              {product.operatingSystem && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Operating System</span>
                  <span className="font-medium text-right">{product.operatingSystem}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Color</span>
                <span className="font-medium text-right">Black</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Warranty</span>
                <span className="font-medium text-right">1 Year</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Warranty Type</span>
                <span className="font-medium text-right">Manufacturer</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Certification</span>
                <span className="font-medium text-right">ISI Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Share Dialog */}
    {showShareDialog && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareDialog(false)}>
        <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Share Product</h3>
            <button onClick={() => setShowShareDialog(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={copyLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
