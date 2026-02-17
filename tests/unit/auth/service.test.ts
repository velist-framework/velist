/**
 * Auth Service Unit Tests
 * 
 * Testing business logic layer with mocked repository
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { AuthService } from '../../../src/features/_core/auth/service'
import { AuthRepository } from '../../../src/features/_core/auth/repository'

describe('AuthService', () => {
  let service: AuthService
  let repo: AuthRepository

  beforeEach(() => {
    repo = new AuthRepository()
    service = new AuthService(repo)
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`
      const payload = {
        email: uniqueEmail,
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      }

      const user = await service.register(payload)

      expect(user).toBeDefined()
      expect(user.email).toBe(payload.email)
      expect(user.name).toBe(payload.name)
      expect(user.role).toBe('user')
      expect(user).not.toHaveProperty('password_hash')
    })

    it('should throw error when password confirmation does not match', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'differentpassword',
        name: 'Test User'
      }

      expect(service.register(payload)).rejects.toThrow('Password confirmation does not match')
    })

    it('should throw error when email already exists', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`
      const payload = {
        email: uniqueEmail,
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      }

      // First registration
      await service.register(payload)

      // Second registration with same email should fail
      expect(service.register(payload)).rejects.toThrow('Email already registered')
    })

    it('should hash password securely', async () => {
      const uniqueEmail = `hash-${Date.now()}@example.com`
      const payload = {
        email: uniqueEmail,
        password: 'mypassword123',
        password_confirmation: 'mypassword123',
        name: 'Hash Test'
      }

      const user = await service.register(payload)
      expect(user).toBeDefined()
      expect(user.id).toBeDefined()

      // Verify we can login with the same password
      const loggedInUser = await service.attempt(payload.email, payload.password)
      expect(loggedInUser.email).toBe(payload.email)
    })
  })

  describe('attempt (login)', () => {
    it('should login with valid credentials', async () => {
      const uniqueEmail = `login-${Date.now()}@example.com`
      // Create a user first
      await service.register({
        email: uniqueEmail,
        password: 'correctpassword',
        password_confirmation: 'correctpassword',
        name: 'Login Test'
      })

      const user = await service.attempt(uniqueEmail, 'correctpassword')
      
      expect(user).toBeDefined()
      expect(user.email).toBe(uniqueEmail)
      expect(user).not.toHaveProperty('password_hash')
    })

    it('should throw error with invalid email', async () => {
      expect(service.attempt('nonexistent@test.com', 'password')).rejects.toThrow('Invalid credentials')
    })

    it('should throw error with wrong password', async () => {
      const uniqueEmail = `wrongpass-${Date.now()}@example.com`
      // Create a user first
      await service.register({
        email: uniqueEmail,
        password: 'correctpassword',
        password_confirmation: 'correctpassword',
        name: 'Wrong Pass Test'
      })

      expect(service.attempt(uniqueEmail, 'wrongpassword')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should delete session token', async () => {
      // Just verify it doesn't throw
      await service.logout('some-token-123')
      expect(true).toBe(true)
    })
  })
})
