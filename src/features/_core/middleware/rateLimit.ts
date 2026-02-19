/**
 * Rate Limiting Middleware
 * 
 * Protects against brute force attacks and abuse.
 * Uses in-memory store with sliding window algorithm.
 * For production with multiple instances, use Redis-backed store.
 */

import { Elysia } from 'elysia'

interface RateLimitStore {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  maxRequests: number      // Maximum requests allowed
  windowMs: number         // Time window in milliseconds
  keyPrefix?: string       // Prefix for rate limit keys
  skipSuccessfulRequests?: boolean  // Don't count successful requests
  skipFailedRequests?: boolean      // Don't count failed requests
}

// In-memory store (use Redis in production with multiple instances)
const store = new Map<string, RateLimitStore>()

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (value.resetTime <= now) {
      store.delete(key)
    }
  }
}, 60000)

function getClientIP(request: Request): string {
  // Get IP from various headers (works behind proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback - in production, this might be the proxy IP
  return 'unknown'
}

function getRateLimitKey(request: Request, prefix: string = ''): string {
  const ip = getClientIP(request)
  const path = new URL(request.url).pathname
  return `${prefix}:${ip}:${path}`
}

function checkRateLimit(key: string, config: RateLimitConfig): { 
  allowed: boolean
  limit: number
  remaining: number
  resetTime: number 
} {
  const now = Date.now()
  const record = store.get(key)
  
  if (!record || record.resetTime <= now) {
    // New window
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }
  
  // Existing window
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: record.resetTime
    }
  }
  
  record.count++
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Create rate limiting middleware
 * 
 * Example:
 * ```typescript
 * app.use(createRateLimit({ maxRequests: 5, windowMs: 60000 })) // 5 req/min
 * ```
 */
export function createRateLimit(config: RateLimitConfig) {
  return new Elysia({ name: 'rate-limit' })
    .onBeforeHandle(({ request, set }) => {
      const key = getRateLimitKey(request, config.keyPrefix)
      const result = checkRateLimit(key, config)
      
      // Set rate limit headers
      set.headers['X-RateLimit-Limit'] = String(result.limit)
      set.headers['X-RateLimit-Remaining'] = String(result.remaining)
      set.headers['X-RateLimit-Reset'] = String(Math.ceil(result.resetTime / 1000))
      
      if (!result.allowed) {
        set.status = 429
        return {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }
      }
    })
}

/**
 * Rate limit configurations for common scenarios
 */
export const rateLimits = {
  // Strict: 5 requests per minute (login, register)
  strict: createRateLimit({
    maxRequests: 5,
    windowMs: 60 * 1000,
    keyPrefix: 'strict'
  }),
  
  // Standard: 100 requests per minute (API endpoints)
  standard: createRateLimit({
    maxRequests: 100,
    windowMs: 60 * 1000,
    keyPrefix: 'standard'
  }),
  
  // Generous: 1000 requests per minute (public endpoints)
  generous: createRateLimit({
    maxRequests: 1000,
    windowMs: 60 * 1000,
    keyPrefix: 'generous'
  }),
  
  // Custom factory
  custom: (maxRequests: number, windowMs: number) => 
    createRateLimit({ maxRequests, windowMs, keyPrefix: 'custom' })
}
