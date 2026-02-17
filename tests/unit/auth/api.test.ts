/**
 * Auth API Unit Tests
 * 
 * Using Elysia's handle() method for testing HTTP requests
 * https://elysiajs.com/patterns/unit-test
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { Elysia } from 'elysia'
import { authApi } from '../../../src/features/_core/auth/api'
import { db } from '../../../src/features/_core/database/connection'

describe('Auth API', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any

  beforeEach(async () => {
    // Create fresh app instance for each test
    app = new Elysia().use(authApi)
    
    // Clean up test users
    await db.deleteFrom('users').where('email', 'like', '%test%').execute().catch(() => {})
  })

  describe('GET /auth/login', () => {
    it('should return login page with Inertia response', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login')
      )

      expect(response.status).toBe(200)
      const html = await response.text()
      // Inertia response contains data-page attribute with component name
      expect(html).toContain('auth/Login')
      expect(html).toContain('data-page')
    })
  })

  describe('GET /auth/register', () => {
    it('should return register page with Inertia response', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register')
      )

      expect(response.status).toBe(200)
      const html = await response.text()
      // Inertia response contains data-page attribute
      expect(html).toContain('auth/Register')
      expect(html).toContain('data-page')
    })
  })

  describe('POST /auth/register', () => {
    it('should register new user successfully and redirect', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`
      
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: uniqueEmail,
            password: 'password123',
            password_confirmation: 'password123',
            name: 'Test User'
          })
        })
      )

      // Registration successful should redirect (303) to dashboard
      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toBe('/dashboard')
    })

    it('should reject registration with mismatched passwords', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'different',
            name: 'Test User'
          })
        })
      )

      // Returns 200 with Inertia page showing errors
      expect(response.status).toBe(200)
      const html = await response.text()
      expect(html).toContain('auth/Register')
    })

    it('should reject registration with invalid email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'invalid-email',
            password: 'password123',
            password_confirmation: 'password123',
            name: 'Test User'
          })
        })
      )

      // Elysia TypeBox validation returns 422 for invalid format
      expect(response.status).toBe(422)
    })

    it('should reject registration with short password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'short',
            password_confirmation: 'short',
            name: 'Test User'
          })
        })
      )

      // Elysia TypeBox validation returns 422 for minLength violation
      expect(response.status).toBe(422)
    })
  })

  describe('POST /auth/login', () => {
    it('should reject login with invalid credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
          })
        })
      )

      // Should show login page with error (200 with Inertia render)
      expect(response.status).toBe(200)
      const html = await response.text()
      expect(html).toContain('auth/Login')
    })

    it('should reject login with invalid email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'invalid-email',
            password: 'password123'
          })
        })
      )

      // Elysia TypeBox validation returns 422
      expect(response.status).toBe(422)
    })

    it('should reject login with short password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'short' // Less than 8 chars
          })
        })
      )

      // Elysia TypeBox validation returns 422 for minLength violation
      expect(response.status).toBe(422)
    })
  })

  describe('POST /auth/logout', () => {
    it('should handle logout request and redirect', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/logout', {
          method: 'POST'
        })
      )

      // Should redirect to login
      expect(response.status).toBe(303)
      expect(response.headers.get('location')).toContain('/auth/login')
    })
  })
})
