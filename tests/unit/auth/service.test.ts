/**
 * Auth Service Unit Tests
 * 
 * True unit tests - all dependencies are mocked.
 * No database access!
 */
import { describe, it, expect, beforeEach } from 'bun:test'
import { AuthService } from '../../../src/features/_core/auth/service'
import { createMockAuthRepository, createMockUser } from '../helpers/mockRepository'
import type { AuthRepository } from '../../../src/features/_core/auth/repository'

describe('AuthService', () => {
  let service: AuthService
  let mockRepo: AuthRepository

  beforeEach(() => {
    mockRepo = createMockAuthRepository()
    service = new AuthService(mockRepo)
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      }

      // Setup mock
      mockRepo.findByEmail.mockResolvedValue(null)
      mockRepo.create.mockImplementation(async (data: any) => ({
        id: 'new-user-id',
        email: data.email,
        password_hash: data.password_hash,
        name: data.name,
        role: 'user',
        google_id: null,
        email_verified_at: null,
        two_factor_secret: null,
        two_factor_enabled: 0,
        two_factor_confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const user = await service.register(payload)

      expect(user).toBeDefined()
      expect(user.email).toBe(payload.email)
      expect(user.name).toBe(payload.name)
      expect(user.role).toBe('user')
      expect(user).not.toHaveProperty('password_hash')
      expect(mockRepo.findByEmail.calls.length).toBe(1)
      expect(mockRepo.create.calls.length).toBe(1)
    })

    it('should throw error when password confirmation does not match', async () => {
      const payload = {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'differentpassword',
        name: 'Test User'
      }

      expect(service.register(payload)).rejects.toThrow('Password confirmation does not match')
      expect(mockRepo.findByEmail.calls.length).toBe(0)
      expect(mockRepo.create.calls.length).toBe(0)
    })

    it('should throw error when email already exists', async () => {
      const payload = {
        email: 'existing@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      }

      // Setup mock - email already exists
      mockRepo.findByEmail.mockResolvedValue(createMockUser({ email: payload.email }))

      expect(service.register(payload)).rejects.toThrow('Email already registered')
      expect(mockRepo.findByEmail.calls.length).toBe(1)
      expect(mockRepo.create.calls.length).toBe(0)
    })

    it('should hash password securely', async () => {
      const payload = {
        email: 'hash-test@example.com',
        password: 'mypassword123',
        password_confirmation: 'mypassword123',
        name: 'Hash Test'
      }

      mockRepo.findByEmail.mockResolvedValue(null)
      let capturedPasswordHash: string = ''
      mockRepo.create.mockImplementation(async (data: any) => {
        capturedPasswordHash = data.password_hash
        return createMockUser({
          email: data.email,
          password_hash: data.password_hash
        })
      })

      await service.register(payload)

      // Verify password was hashed (bcrypt hash starts with $2)
      expect(capturedPasswordHash).toStartWith('$2')
      expect(capturedPasswordHash.length).toBeGreaterThan(50)
    })
  })

  describe('attempt (login)', () => {
    it('should login with valid credentials', async () => {
      const email = 'valid@example.com'
      const password = 'correctpassword'
      
      // Create user with hashed password
      const passwordHash = await Bun.password.hash(password, { algorithm: 'bcrypt' })
      mockRepo.findByEmail.mockResolvedValue(createMockUser({
        email,
        password_hash: passwordHash
      }))

      const user = await service.attempt(email, password)

      expect(user).toBeDefined()
      expect(user.email).toBe(email)
      expect(user).not.toHaveProperty('password_hash')
    })

    it('should throw error with invalid email', async () => {
      mockRepo.findByEmail.mockResolvedValue(null)

      expect(service.attempt('nonexistent@test.com', 'password'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should throw error with wrong password', async () => {
      const email = 'valid@example.com'
      const correctPassword = 'correctpassword'
      const wrongPassword = 'wrongpassword'
      
      const passwordHash = await Bun.password.hash(correctPassword, { algorithm: 'bcrypt' })
      mockRepo.findByEmail.mockResolvedValue(createMockUser({
        email,
        password_hash: passwordHash
      }))

      expect(service.attempt(email, wrongPassword))
        .rejects.toThrow('Invalid credentials')
    })

    it('should handle SQL injection attempts in email', async () => {
      const maliciousEmails = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
        "<script>alert('xss')</script>"
      ]

      mockRepo.findByEmail.mockResolvedValue(null)

      for (const email of maliciousEmails) {
        await expect(service.attempt(email, 'password'))
          .rejects.toThrow('Invalid credentials')
      }
    })
  })

  describe('logout', () => {
    it('should delete session token', async () => {
      mockRepo.deleteSession.mockResolvedValue(undefined)
      
      await service.logout('some-token-123')
      
      expect(mockRepo.deleteSession.calls.length).toBe(1)
      expect(mockRepo.deleteSession.calls[0]).toEqual(['some-token-123'])
    })
  })

  describe('findOrCreateGoogleUser', () => {
    it('should return existing user by Google ID', async () => {
      const googleUser = {
        id: 'google-123',
        email: 'google@example.com',
        name: 'Google User',
        email_verified: true
      }

      mockRepo.findByGoogleId.mockResolvedValue(createMockUser({
        google_id: googleUser.id,
        email: googleUser.email
      }))

      const user = await service.findOrCreateGoogleUser(googleUser)

      expect(user.email).toBe(googleUser.email)
      expect(mockRepo.findByGoogleId.calls.length).toBe(1)
      expect(mockRepo.create.calls.length).toBe(0) // Should not create new user
    })

    it('should link Google account to existing user by email', async () => {
      const googleUser = {
        id: 'google-456',
        email: 'existing@example.com',
        name: 'Existing User',
        email_verified: true
      }

      mockRepo.findByGoogleId.mockResolvedValue(null)
      mockRepo.findByEmail.mockResolvedValue(createMockUser({
        email: googleUser.email,
        google_id: null
      }))
      mockRepo.linkGoogleAccount.mockResolvedValue(undefined)

      const user = await service.findOrCreateGoogleUser(googleUser)

      expect(user.email).toBe(googleUser.email)
      expect(mockRepo.linkGoogleAccount.calls.length).toBe(1)
    })

    it('should create new user for new Google account', async () => {
      const googleUser = {
        id: 'google-789',
        email: 'new@example.com',
        name: 'New User',
        email_verified: true
      }

      mockRepo.findByGoogleId.mockResolvedValue(null)
      mockRepo.findByEmail.mockResolvedValue(null)
      mockRepo.create.mockImplementation(async (data: any) => createMockUser({
        email: data.email,
        name: data.name,
        google_id: data.google_id
      }))

      const user = await service.findOrCreateGoogleUser(googleUser)

      expect(user.email).toBe(googleUser.email)
      expect(user.name).toBe(googleUser.name)
      expect(mockRepo.create.calls.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(200) + '@example.com'
      const payload = {
        email: longEmail,
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      }

      mockRepo.findByEmail.mockResolvedValue(null)
      mockRepo.create.mockImplementation(async (data: any) => createMockUser({
        email: data.email
      }))

      const user = await service.register(payload)
      expect(user.email).toBe(longEmail)
    })

    it('should handle special characters in name', async () => {
      const specialName = "O'Brien-Smith Jr. \u00E9\u00E0\u00FC"  // éàü
      const payload = {
        email: 'special@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: specialName
      }

      mockRepo.findByEmail.mockResolvedValue(null)
      mockRepo.create.mockImplementation(async (data: any) => createMockUser({
        name: data.name
      }))

      const user = await service.register(payload)
      expect(user.name).toBe(specialName)
    })

    it('should handle repository errors gracefully', async () => {
      mockRepo.findByEmail.mockRejectedValue(new Error('Database connection lost'))

      await expect(service.attempt('test@example.com', 'password'))
        .rejects.toThrow('Database connection lost')
    })
  })
})
