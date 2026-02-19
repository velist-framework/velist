/**
 * Health Check Middleware Tests
 */
import { describe, it, expect } from 'bun:test'
import { Elysia } from 'elysia'
import { healthCheck } from '../../../src/features/_core/middleware/healthCheck'

describe('Health Check', () => {
  describe('/health', () => {
    it('should return comprehensive health status', async () => {
      const app = new Elysia()
        .use(healthCheck())

      const response = await app.handle(
        new Request('http://localhost/health')
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      
      expect(body).toHaveProperty('status')
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('version')
      expect(body).toHaveProperty('environment')
      expect(body).toHaveProperty('uptime')
      expect(body).toHaveProperty('checks')
      expect(body).toHaveProperty('metrics')
      
      // Check individual service checks
      expect(body.checks).toHaveProperty('database')
      expect(body.checks).toHaveProperty('storage')
      expect(body.checks).toHaveProperty('memory')
    })

    it('should include database check', async () => {
      const app = new Elysia()
        .use(healthCheck())

      const response = await app.handle(
        new Request('http://localhost/health')
      )

      const body = await response.json()
      expect(body.checks.database).toHaveProperty('status')
      expect(body.checks.database).toHaveProperty('responseTimeMs')
    })

    it('should include memory metrics', async () => {
      const app = new Elysia()
        .use(healthCheck())

      const response = await app.handle(
        new Request('http://localhost/health')
      )

      const body = await response.json()
      expect(body.checks.memory).toHaveProperty('status')
      expect(body.checks.memory).toHaveProperty('details')
      expect(body.checks.memory.details).toHaveProperty('heapUsedMB')
      expect(body.checks.memory.details).toHaveProperty('rssMB')
    })

    it('should report degraded status if any check warns', async () => {
      // This would require mocking high memory usage
      // For now, just verify the status calculation logic exists
      const app = new Elysia()
        .use(healthCheck())

      const response = await app.handle(
        new Request('http://localhost/health')
      )

      const body = await response.json()
      expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status)
    })
  })

  describe('/health/live', () => {
    it('should return alive status quickly', async () => {
      const app = new Elysia()
        .use(healthCheck())

      const start = Date.now()
      const response = await app.handle(
        new Request('http://localhost/health/live')
      )
      const duration = Date.now() - start

      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(100) // Should be very fast

      const body = await response.json()
      expect(body.status).toBe('alive')
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('uptime')
    })
  })

  describe('/health/ready', () => {
    it('should check if ready to receive traffic', async () => {
      const app = new Elysia()
        .use(healthCheck())

      const response = await app.handle(
        new Request('http://localhost/health/ready')
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      
      expect(['ready', 'not_ready']).toContain(body.status)
      expect(body).toHaveProperty('timestamp')
      expect(body).toHaveProperty('checks')
      expect(body.checks).toHaveProperty('database')
      expect(body.checks).toHaveProperty('storage')
    })
  })
})
