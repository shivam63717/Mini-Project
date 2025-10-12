import { NextRequest } from 'next/server'
import { RedisService } from '@/lib/database/redis'
import { ApiResponseHandler } from '@/lib/api/response'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

const DEFAULT_KEY_GENERATOR = (request: NextRequest): string => {
  // Use IP address as default key
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
  return `rate_limit:${ip}`
}

export class RateLimiter {
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: DEFAULT_KEY_GENERATOR,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    }
  }

  async check(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(request)
    const windowKey = `${key}:${Math.floor(Date.now() / this.config.windowMs)}`
    
    try {
      // Get current count
      const currentCount = await RedisService.get<number>(windowKey) || 0
      
      // Check if limit exceeded
      if (currentCount >= this.config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.floor(Date.now() / this.config.windowMs) * this.config.windowMs + this.config.windowMs,
          totalHits: currentCount
        }
      }

      // Increment counter
      const newCount = currentCount + 1
      await RedisService.set(windowKey, newCount, Math.ceil(this.config.windowMs / 1000))

      return {
        allowed: true,
        remaining: this.config.maxRequests - newCount,
        resetTime: Math.floor(Date.now() / this.config.windowMs) * this.config.windowMs + this.config.windowMs,
        totalHits: newCount
      }
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      console.error('Rate limiting error:', error)
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        totalHits: 0
      }
    }
  }

  async reset(key: string): Promise<void> {
    const pattern = `rate_limit:${key}:*`
    const keys = await RedisService.keys(pattern)
    
    if (keys.length > 0) {
      await Promise.all(keys.map(k => RedisService.del(k)))
    }
  }
}

// Pre-configured rate limiters
export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  keyGenerator: (request: NextRequest) => {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return `auth_rate_limit:${ip}`
  }
})

export const apiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
})

export const strictRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
})

// Higher-order function for rate limiting
export function withRateLimit(
  rateLimiter: RateLimiter,
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const result = await rateLimiter.check(request)
    
    if (!result.allowed) {
      return ApiResponseHandler.tooManyRequests(
        'Rate limit exceeded',
        `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds`
      )
    }

    const response = await handler(request)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimiter.config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    return response
  }
}

// Utility for user-specific rate limiting
export function createUserRateLimit(userId: string, config: Partial<RateLimitConfig> = {}) {
  return new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    keyGenerator: () => `user_rate_limit:${userId}`,
    ...config
  })
}
