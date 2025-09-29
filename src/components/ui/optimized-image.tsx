"use client"

import { useState } from "react"
import { useImageCache } from "@/hooks/use-image-cache"

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className = "", 
  fallback = "/placeholder.svg" 
}: OptimizedImageProps) {
  const { cachedSrc, loading: cacheLoading } = useImageCache(src)
  const [imgSrc, setImgSrc] = useState(cachedSrc || src)
  const [loading, setLoading] = useState(cacheLoading)

  return (
    <div className={`relative overflow-hidden`}>
      {loading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded ${className}`} />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImgSrc(fallback)
          setLoading(false)
        }}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}