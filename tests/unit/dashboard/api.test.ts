/**
 * Dashboard API Unit Tests
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { Elysia } from 'elysia'
import { dashboardApi } from '../../../src/features/dashboard/api'

describe('Dashboard API', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any

  beforeEach(() => {
    app = new Elysia().use(dashboardApi)
  })

  describe('GET /dashboard', () => {
    it('should redirect to login when not authenticated', async () => {
      const response = await app.handle(
        new Request('http://localhost/dashboard')
      )

      // Redirect status is 303 (See Other)
      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toContain('/auth/login')
    })
  })

  describe('GET /dashboard/api/stats', () => {
    it('should require authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/dashboard/api/stats')
      )

      // Without auth, should redirect
      expect([302, 303]).toContain(response.status)
    })
  })
})
