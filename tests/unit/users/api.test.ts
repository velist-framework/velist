/**
 * Users API Unit Tests
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { Elysia } from 'elysia'
import { usersApi } from '../../../src/features/users/api'

describe('Users API', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any

  beforeEach(() => {
    app = new Elysia().use(usersApi)
  })

  describe('GET /users', () => {
    it('should redirect to login when not authenticated', async () => {
      const response = await app.handle(
        new Request('http://localhost/users')
      )

      // Redirect status is 303 (See Other)
      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toContain('/auth/login')
    })

    it('should require authentication', async () => {
      const response = await app.handle(
        new Request('http://localhost/users')
      )

      // Should be redirected to login
      expect([302, 303]).toContain(response.status)
      expect(response.headers.get('location')).toContain('/auth/login')
    })
  })
})
