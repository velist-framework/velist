/**
 * Rate Limiting Middleware Tests
 */
import { describe, it, expect } from 'bun:test'
import { createRateLimit, rateLimits } from '../../../src/features/_core/middleware/rateLimit'

describe('Rate Limiting', () => {
  it('createRateLimit should return an Elysia plugin', () => {
    const limiter = createRateLimit({ maxRequests: 5, windowMs: 60000 })
    expect(limiter).toBeDefined()
    expect(limiter.config).toBeDefined()
    expect(limiter.config.name).toBe('rate-limit')
  })

  it('should have predefined rate limits', () => {
    expect(rateLimits.strict).toBeDefined()
    expect(rateLimits.standard).toBeDefined()
    expect(rateLimits.generous).toBeDefined()
  })
})
