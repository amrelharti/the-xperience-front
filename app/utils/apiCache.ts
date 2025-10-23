/**
 * Simple in-memory API cache for performance optimization
 * Reduces redundant API calls and improves response times
 */

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get data from cache if it exists and hasn't expired
   */
  get(key: string): any | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired, remove it
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Store data in cache with optional TTL
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new APICache()

/**
 * Enhanced fetch function with caching
 */
export async function fetchWithCache(
  url: string, 
  options: RequestInit = {}, 
  ttl?: number
): Promise<Response> {
  const cacheKey = `${url}:${JSON.stringify(options)}`
  
  // Try to get from cache first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData) {
    return new Response(JSON.stringify(cachedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Fetch from API
  const response = await fetch(url, options)
  
  if (response.ok) {
    const data = await response.json()
    // Cache the successful response
    apiCache.set(cacheKey, data, ttl)
  }

  return response
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all admin-related cache entries
  invalidateAdmin: () => {
    for (const key of apiCache.getStats().entries) {
      if (key.includes('/admin/')) {
        apiCache.delete(key)
      }
    }
  },

  // Invalidate course-related cache entries
  invalidateCourses: () => {
    for (const key of apiCache.getStats().entries) {
      if (key.includes('/courses/') || key.includes('/modules/')) {
        apiCache.delete(key)
      }
    }
  },

  // Invalidate user-related cache entries
  invalidateUsers: () => {
    for (const key of apiCache.getStats().entries) {
      if (key.includes('/users/') || key.includes('/me')) {
        apiCache.delete(key)
      }
    }
  }
}

// Clean up expired entries every 10 minutes
setInterval(() => {
  apiCache.cleanup()
}, 10 * 60 * 1000)


