"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";
import { toast } from "sonner";
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, RotateCcw, CreditCard, Check, ChevronRight, Award, Copy, X } from "lucide-react";
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
  cpuModel?: string;
  operatingSystem?: string;
  graphics?: string;
  color?: string;
  modelName?:string;
  ramOptions?: { size: string; price: number; quantity: number }[];
  storageOptions?: { size: string; price: number; quantity: number }[];
  warrantyOptions?: { duration: string; price: number }[];
  boxContents?:string;
};

export default function ProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedRam, setSelectedRam] = useState<{ size: string; price: number; quantity: number } | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<{ size: string; price: number; quantity: number } | null>(null);
  const [availableStock, setAvailableStock] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showMobileZoom, setShowMobileZoom] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (showMobileZoom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileZoom]);
  const [selectedWarranty, setSelectedWarranty] = useState<{ duration: string; price: number } | null>(null);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (availableStock === 0) {
      toast.error("Out of Stock", {
        description: "This configuration is currently unavailable.",
      });
      return;
    }
    
    if (quantity > availableStock) {
      toast.error("Insufficient Stock", {
        description: `Only ${availableStock} items available for this configuration.`,
      });
      return;
    }
    
    const itemPrice = finalPrice + (selectedWarranty?.price || 0);
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: itemPrice,
        image: product.frontImage || product.image || product.coverImage || "/no-image.svg",
        color: selectedColor || product.color,
        selectedRam: selectedRam?.size || undefined,
        selectedStorage: selectedStorage?.size || undefined,
        warranty: selectedWarranty || undefined
      });
    }
    
    if (selectedRam && selectedStorage) {
      const updatedRamOptions = product.ramOptions?.map(r => 
        r.size === selectedRam.size ? { ...r, quantity: r.quantity - quantity } : r
      );
      const updatedStorageOptions = product.storageOptions?.map(s => 
        s.size === selectedStorage.size ? { ...s, quantity: s.quantity - quantity } : s
      );
      setProduct({ ...product, ramOptions: updatedRamOptions, storageOptions: updatedStorageOptions });
      
      // Update selectedRam reference to reflect new quantity
      const updatedSelectedRam = updatedRamOptions?.find(r => r.size === selectedRam.size);
      if (updatedSelectedRam) {
        setSelectedRam(updatedSelectedRam);
      }
      
      setAvailableStock(availableStock - quantity);
    }
    setQuantity(1);
    
    toast.success("Added to Cart", {
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (availableStock === 0) {
      toast.error("Out of Stock", {
        description: "This configuration is currently unavailable.",
      });
      return;
    }
    
    if (quantity > availableStock) {
      toast.error("Insufficient Stock", {
        description: `Only ${availableStock} items available for this configuration.`,
      });
      return;
    }
    
    const itemPrice = finalPrice + (selectedWarranty?.price || 0);
    
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: itemPrice,
        image: product.frontImage || product.image || product.coverImage || "/no-image.svg",
        color: selectedColor || product.color,
        selectedRam: selectedRam?.size || undefined,
        selectedStorage: selectedStorage?.size || undefined,
        warranty: selectedWarranty || undefined
      });
    }
    
    if (selectedRam && selectedStorage) {
      const updatedRamOptions = product.ramOptions?.map(r => 
        r.size === selectedRam.size ? { ...r, quantity: r.quantity - quantity } : r
      );
      const updatedStorageOptions = product.storageOptions?.map(s => 
        s.size === selectedStorage.size ? { ...s, quantity: s.quantity - quantity } : s
      );
      setProduct({ ...product, ramOptions: updatedRamOptions, storageOptions: updatedStorageOptions });
      
      // Update selectedRam reference to reflect new quantity
      const updatedSelectedRam = updatedRamOptions?.find(r => r.size === selectedRam.size);
      if (updatedSelectedRam) {
        setSelectedRam(updatedSelectedRam);
      }
    }
    
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

  const copyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => toast.success("Link copied!"))
        .catch(() => {
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
        });
    } else {
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
    }
  };

  useEffect(() => {
    if (!slug) return;

    fetch("/api/products", { cache: "no-store" })
      .then((res) => res.json())
      .then((products) => {
        const found = products.find((p: any) => 
          p.slug === slug || 
          p.id === slug ||
          p.name.toLowerCase().replace(/\s+/g, "-") === slug
        );
        
        if (found) {
          const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]")
          
          // Update RAM options quantities based on cart
          if (found.ramOptions && found.ramOptions.length > 0) {
            found.ramOptions = found.ramOptions.map((ram: any) => {
              const cartQty = cart.reduce((sum: number, item: any) => 
                item.id === found.id && item.selectedRam === ram.size ? sum + (item.qty || 1) : sum, 0
              );
              return { ...ram, quantity: Math.max(0, ram.quantity - cartQty) };
            });
          }
          
          // Update storage options quantities based on cart
          if (found.storageOptions && found.storageOptions.length > 0) {
            found.storageOptions = found.storageOptions.map((storage: any) => {
              const cartQty = cart.reduce((sum: number, item: any) => 
                item.id === found.id && item.selectedStorage === storage.size ? sum + (item.qty || 1) : sum, 0
              );
              return { ...storage, quantity: Math.max(0, storage.quantity - cartQty) };
            });
          }
          
          const cartQty = cart.reduce((sum: number, item: any) => 
            item.id === found.id ? sum + (item.qty || 1) : sum, 0
          )
          found.quantity = Math.max(0, found.quantity - cartQty)
          setIsWishlisted(isInWishlist(found.id));
          setProduct(found);
          if (found.color) {
            const colors = found.color.split(',').map((c: string) => c.trim());
            setSelectedColor(colors[0]);
          }
          
          // Set default RAM and storage (first available option)
          if (found.ramOptions && found.ramOptions.length > 0) {
            const availableRam = found.ramOptions.find((r: any) => r.quantity > 0);
            setSelectedRam(availableRam || found.ramOptions[0]);
          }
          if (found.storageOptions && found.storageOptions.length > 0) {
            setSelectedStorage(found.storageOptions[0]);
          }
          
          setFinalPrice(found.price);
          
          fetch(`/api/reviews?productId=${found.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.reviews) setReviews(data.reviews)
            })
            .catch(() => setReviews([]))
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (product) {
        setIsWishlisted(isInWishlist(product.id));
      }
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [product]);

  // Calculate final price and available stock based on selected options
  useEffect(() => {
    if (product) {
      let price = product.price;
      if (selectedRam) price += selectedRam.price;
      if (selectedStorage) price += selectedStorage.price;
      setFinalPrice(price);
      
      // Calculate available stock based on selected configuration
      if (selectedRam && selectedStorage) {
        const cart = JSON.parse(localStorage.getItem("v0_cart") || "[]")
        const cartQty = cart.reduce((sum: number, item: any) => 
          item.id === product.id && 
          item.selectedRam === selectedRam.size && 
          item.selectedStorage === selectedStorage.size 
            ? sum + (item.qty || 1) : sum, 0
        )
        const stock = Math.min(selectedRam.quantity, selectedStorage.quantity) - cartQty;
        setAvailableStock(Math.max(0, stock));
      }
      
      // Auto-select next available RAM if current is out of stock
      if (selectedRam && selectedRam.quantity === 0 && product.ramOptions) {
        const nextAvailableRam = product.ramOptions.find((r: any) => r.quantity > 0 && r.size !== selectedRam.size);
        if (nextAvailableRam) {
          setSelectedRam(nextAvailableRam);
        }
      }
    }
  }, [product, selectedRam, selectedStorage]);

  if (loading) return (
   <Loading/>
  );
  
  if (!product) return (
      <div className="text-center -mt-16 py-12 min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-2">The product you&apos;re looking for doesn&apos;t exist.</p>
        <button 
          onClick={() => router.push('/')}
          className="text-blue-600 rounded-lg hover:underline font-medium"
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
  const mrp = Number(product.mrp) || 0;
  const price = finalPrice;
  const baseMrp = mrp + (selectedRam?.price || 0) + (selectedStorage?.price || 0);
  const discount = baseMrp > 0 && baseMrp > price ? Math.round(((baseMrp - price) / baseMrp) * 100) : 0;

  return (
    <>
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        {/* <div className="bg-white rounded-lg px-2 sm:px-4 py-3 mb-4 my-2 shadow-sm"> */}
          <div className="text-xs sm:text-sm text-gray-600 flex items-center my-4 sm:mt-2 sm:mb-3 flex-wrap gap-1">
            <span className="hover:text-blue-600 cursor-pointer hover:underline transition-colors" onClick={() => router.push('/')}>Home</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hover:text-blue-600 cursor-pointer hover:underline transition-colors" onClick={() => router.push(`/category/${product.category.toLowerCase()}`)}>{product.category}</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-black font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
          </div>
        {/* </div> */}

        <div className="grid lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {/* Left: Images */}
          <div className="lg:col-span-2 bg-white rounded-lg p-3 sm:p-4 lg:p-6 h-fit lg:sticky top-24 relative!mt-0  border border-gray-100">
            <div 
              className="aspect-square bg-white-50 rounded-lg mb-3 sm:mb-4 overflow-visible relative group"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomPosition({ x, y });
              }}
              onClick={(e) => {
                if (window.innerWidth < 1024) {
                  setShowMobileZoom(true);
                }
              }}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-2 sm:p-4 cursor-pointer lg:cursor-crosshair"
              />
              {showZoom && (
                <div 
                  className="hidden lg:block fixed w-[60vw] h-[85vh] bg-white pointer-events-none border border-gray-200 rounded-lg"
                  style={{
                    backgroundImage: `url(${images[selectedImage]})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: '120%',
                    backgroundRepeat: 'no-repeat',
                    right: '20px',
                    top: '52%',
                    bottom: '0% !important',
                    transform: 'translateY(-50%)',
                    zIndex: 9999,
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                />
              )}
              {discount > 0 && (
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-bold">
                  {discount}% OFF
                </div>
              )}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2" onMouseEnter={() => setShowZoom(false)} onMouseLeave={() => setShowZoom(true)}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const added = toggleWishlist({
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      image: product.frontImage || product.image || product.coverImage || "/no-image.svg",
                      description: product.description
                    });
                    setIsWishlisted(added);
                    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
                  }}
                  className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                      isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform sm:hidden"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Action Icons */}
            <div className="hidden sm:flex gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button onClick={handleShare} className="flex-1 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center gap-1.5 sm:gap-2 transition-all font-medium">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Share</span>
              </button>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 break-words">{product.name}</h1>
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
                <div className="flex items-baseline gap-2 sm:gap-3 mb-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">₹{price.toLocaleString()}</span>
                  {baseMrp > 0 && baseMrp > price && (
                    <>
                      <span className="text-gray-500 line-through text-lg sm:text-xl font-semibold">₹{baseMrp.toLocaleString()}</span>
                      <span className="text-green-600 font-semibold text-sm sm:text-base">{discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of all taxes</p>
              </div>

              {/* Stock Status & Quantity */}
              <div className="mb-6 space-y-4">
                <div>
                  {availableStock === 0 ? (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      Out of Stock
                    </span>
                  ) : availableStock <= 5 ? (
                    <span className="text-orange-600 font-semibold flex items-center gap-1">
                      {/* <span className="w-2 h-2 z-0 bg-orange-600 rounded-full animate-pulse"></span> */}
                      Only {availableStock} left in stock - Order soon!
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      In Stock - Ready to Ship
                    </span>
                  )}
                </div>
                
                {availableStock > 0 && (
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
                        onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                        className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
                
                {product.color && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Color:</span>
                    <div className="flex gap-2 flex-wrap">
                      {product.color.split(',').map((color: string) => {
                        const trimmedColor = color.trim();
                        return (
                          <button
                            key={trimmedColor}
                            type="button"
                            onClick={() => setSelectedColor(trimmedColor)}
                            className={`px-4 py-2 rounded-lg font-medium border-2 transition-all flex items-center gap-2 bg-white ${
                              selectedColor === trimmedColor
                                ? 'border-blue-600 text-gray-800'
                                : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50/40'
                            }`}
                          >
                            <div className="h-5 w-5 rounded-full border border-gray-400" style={{ backgroundColor: trimmedColor.toLowerCase() === 'silver' || trimmedColor.toLowerCase() === 'sliver' ? '#C0C0C0' : trimmedColor.toLowerCase() }}></div>
                            {trimmedColor.charAt(0).toUpperCase() + trimmedColor.slice(1).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* RAM Options */}
                {product.ramOptions && product.ramOptions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">RAM:</span>
                    <div className="flex gap-2 flex-wrap">
                      {product.ramOptions.map((ram, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedRam(ram)}
                          disabled={ram.quantity === 0}
                          className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            ram.quantity === 0
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedRam?.size === ram.size
                              ? 'border-blue-600 text-gray-800'
                              : 'border-gray-300 bg-white hover:border-blue-600 hover:bg-blue-50/40'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{ram.size}</span>
                            {ram.price !== 0 && (
                              <span className="text-xs mt-0.5">
                                {ram.price > 0 ? `+₹${ram.price.toLocaleString()}` : `₹${ram.price.toLocaleString()}`}
                              </span>
                            )}
                            {ram.quantity === 0 && (
                              <span className="text-xs text-red-500 mt-0.5">Out of Stock</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Storage Options */}
                {product.storageOptions && product.storageOptions.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 block mb-2">Storage:</span>
                    <div className="flex gap-2 flex-wrap">
                      {product.storageOptions.map((storage, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedStorage(storage)}
                          disabled={selectedRam?.quantity === 0 || storage.quantity === 0}
                          className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedRam?.quantity === 0 || storage.quantity === 0
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedStorage?.size === storage.size
                              ? 'border-blue-600 text-gray-800'
                              : 'border-gray-300 bg-white hover:border-blue-600 hover:bg-blue-50/40'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{storage.size}</span>
                            {storage.price !== 0 && (
                              <span className="text-xs mt-0.5">
                                {storage.price > 0 ? `+₹${storage.price.toLocaleString()}` : `₹${storage.price.toLocaleString()}`}
                              </span>
                            )}
                            {storage.quantity === 0 && (
                              <span className="text-xs text-red-500 mt-0.5">Out of Stock</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              {availableStock === 0 || (selectedRam && selectedRam.quantity === 0) ? (
                <div></div>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <button 
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3 sm:py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    ADD TO CART
                  </button>
                  <button 
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    BUY NOW
                  </button>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4 border-t">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">Free Delivery</div>
                    <div className="text-xs text-gray-600 hidden sm:block">On orders above ₹500</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">7 Days Return</div>
                    <div className="text-xs text-gray-600 hidden sm:block">Easy return policy</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">1 Year Warranty</div>
                    <div className="text-xs text-gray-600 hidden sm:block">Manufacturer warranty</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">Cash on Delivery</div>
                    <div className="text-xs text-gray-600 hidden sm:block">Pay on delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Warranty */}
            {product.warrantyOptions && product.warrantyOptions.length > 0 && (
              <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border-2 border-blue-100">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">Extended Warranty</h3>
                </div>
               {selectedWarranty && (
                  <button
                  onClick={() => setSelectedWarranty(null)}
                  className="-mt-5 text-red-600 hover:text-red-700 hover:cursor-pointer"
                  >
                    Remove
                      {/* <X className="w-4 h-4 text-red-500 hover:text-red-600 hover:cursor-pointer" /> */}
                    </button>
                  )}
                  </div>
                <div className="space-y-2">
                  {product.warrantyOptions.map((warranty, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedWarranty(selectedWarranty?.duration === warranty.duration ? null : warranty)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        selectedWarranty?.duration === warranty.duration
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="font-medium">{warranty.duration} Extended Warranty</span>
                      <span className="font-bold text-blue-600">₹{warranty.price.toLocaleString()}</span>
                    </button>
                  ))}
                  
                </div>
              </div>
            )}
            
            {/* Why Buy */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm">
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
        <div className="mt-4 sm:mt-6 grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-lg p-3 py-4 sm:p-4 lg:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Product Description</h2>
            <div className="text-xs sm:text-sm text-black leading-relaxed mb-6 space-y-2">
              {product.description && product.description.split('\n').map((line, index) => (
                <p key={index} className="break-words mb-0">{line}</p>
              ))}
            </div>
            
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
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm h-fit">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Specifications</h2>
            <div className="space-y-3 text-xs sm:text-sm">
              {product.brand && (
                <div className="flex justify-between gap-2 py-2 border-b">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium text-right break-words">{product.brand}</span>
                </div>
              )}
              {product.modelName && (
                <div className="flex justify-between gap-2 py-2 border-b">
                  <span className="text-gray-600 flex-shrink-0">Model Name</span>
                  <span className="font-medium text-right break-words">{product.modelName}</span>
                </div>
              )}
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
              {selectedRam && (
                <div className="flex justify-between py-2 border-b ">
                  <span className="text-gray-600">RAM</span>
                  <span className="font-medium text-right">
                    {selectedRam.size}
                  </span>
                </div>
              )}
              {selectedStorage && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-medium text-right">
                    {selectedStorage.size}
                  </span>
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

            
            <h3 className="text-lg font-semibold mb-3 mt-6">What&apos;s in the Box</h3>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              {product.boxContents && product.boxContents.split('\n').map((line, index) => (
                <li key={index} className="break-words">{line}</li>
              ))}
            </ol>
          </div>
          

         
        </div>


        {/* Reviews Section */}
{reviews.length > 0 && (
  <div className="mt-6 w-full bg-white rounded-lg p-4 sm:p-6 shadow-sm">
    <h2 className="text-xl sm:text-2xl font-bold mb-6">Reviews</h2>
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <div
          key={review.id}
          className="p-4 sm:p-5 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="font-semibold text-gray-900 text-sm sm:text-base">{review.userName}</div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 text-sm sm:text-base mb-3 break-words whitespace-pre-wrap line-clamp-3">{review.comment}</p>

          {review.adminReply && (
            <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="text-sm sm:text-base font-semibold text-blue-900 mb-1">Seller Response:</div>
              <div className="text-sm sm:text-base text-gray-700">{review.adminReply}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

      </div>
    </div>

    

    {/* Share Dialog */}
    {showShareDialog && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowShareDialog(false)}>
        <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold">Share Product</h3>
            <button onClick={() => setShowShareDialog(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => {
                const url = window.location.href;
                window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + url)}`, '_blank');
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            <button
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">Facebook</span>
            </button>

            <button
              onClick={() => {
                const url = window.location.href;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">Twitter</span>
            </button>

            <button
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-700 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">LinkedIn</span>
            </button>

            <button
              onClick={() => {
                const url = window.location.href;
                window.open(`https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(product.name)}`, '_blank');
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <span className="text-xs font-medium">Telegram</span>
            </button>

            {navigator.share && (
              <button
                onClick={() => {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href
                  }).catch(() => {});
                }}
                className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs font-medium">More</span>
              </button>
            )}

            <button
              onClick={() => {
                const url = window.location.href;
                const subject = encodeURIComponent(product.name);
                const body = encodeURIComponent(`Check out this product: ${product.name}\n\n${url}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Email</span>
            </button>

            <button
              onClick={copyLink}
              className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Copy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xs font-medium">Copy Link</span>
            </button>
          </div>

          {/* URL Display */}
          <div className="flex gap-2 pt-3 border-t">
            <input
              type="text"
              value={window.location.href}
              readOnly
              className="flex-1 px-2 sm:px-3 py-2 border rounded text-xs sm:text-sm bg-gray-50 truncate"
            />
          </div>
        </div>
      </div>
    )}

    {/* Mobile Zoom Dialog */}
    {showMobileZoom && (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col lg:hidden overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const added = toggleWishlist({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.frontImage || product.image || product.coverImage || "/no-image.svg",
                  description: product.description
                });
                setIsWishlisted(added);
                toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
              }}
              className="p-2 bg-white rounded-full border-1 border-gray-300"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
            <button
              onClick={() => {
                setShowMobileZoom(false);
                handleShare();
              }}
              className="p-2 bg-white rounded-full border-1 border-gray-300"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => setShowMobileZoom(false)}
            className="p-2 bg-white rounded-full border-1 border-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div 
          className="flex-1 relative min-h-0 overflow-hidden"
          onTouchStart={(e) => {
            setTouchStart(e.targetTouches[0].clientX);
            setIsDragging(true);
          }}
          onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
          onTouchEnd={() => {
            setIsDragging(false);
            if (images.length > 1 && touchStart - touchEnd > 50 && selectedImage < images.length - 1) {
              setSelectedImage(selectedImage + 1);
            }
            if (images.length > 1 && touchStart - touchEnd < -50 && selectedImage > 0) {
              setSelectedImage(selectedImage - 1);
            }
            setTouchEnd(0);
          }}
        >
          {images.length > 1 && selectedImage > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(selectedImage - 1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full z-10"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
          )}
          <div 
            className="flex h-full"
            style={{
              transform: `translateX(calc(-${selectedImage * 100}% + ${isDragging && touchEnd ? touchEnd - touchStart : 0}px))`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                <img
                  src={img}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
          {images.length > 1 && selectedImage < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(selectedImage + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 justify-center p-4 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden ${
                  selectedImage === index ? 'border-blue-600' : 'border-white'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    )}
    </>
  );
}