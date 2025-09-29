// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key)
    return null
  }
  
  return cached.data
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 30000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  })
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    return
  }
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit, 
  ttlMs: number = 30000
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`
  
  // Try cache first
  const cached = getCachedData<T>(cacheKey)
  if (cached) return cached
  
  // Fetch and cache
  const response = await fetch(url, options)
  const data = await response.json()
  
  if (response.ok) {
    setCachedData(cacheKey, data, ttlMs)
  }
  
  return data
}