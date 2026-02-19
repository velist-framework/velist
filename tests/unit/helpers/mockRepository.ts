/**
 * Mock Repository Helpers
 * 
 * Provides type-safe mocks for repositories to enable true unit testing.
 * No database access in unit tests!
 */

import type { AuthRepository } from '../../../src/features/_core/auth/repository'
import type { User, NewUser } from '../../../src/features/_core/database/connection'

// Mock user factory
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    name: 'Test User',
    role: 'user',
    google_id: null,
    email_verified_at: null,
    two_factor_secret: null,
    two_factor_enabled: 0,
    two_factor_confirmed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }
}

// Create a mock function type
type MockFn<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockFn<T>
  mockRejectedValue: (value: any) => MockFn<T>
  mockImplementation: (fn: T) => MockFn<T>
  mockClear: () => void
  calls: Parameters<T>[]
}

function createMockFn<T extends (...args: any[]) => any>(): MockFn<T> {
  const calls: Parameters<T>[] = []
  let implementation: T | undefined
  
  const mockFn = ((...args: Parameters<T>): ReturnType<T> => {
    calls.push(args)
    if (implementation) {
      return implementation(...args)
    }
    return undefined as ReturnType<T>
  }) as MockFn<T>
  
  mockFn.mockResolvedValue = (value) => {
    implementation = (() => Promise.resolve(value)) as T
    return mockFn
  }
  
  mockFn.mockRejectedValue = (value) => {
    implementation = (() => Promise.reject(value)) as T
    return mockFn
  }
  
  mockFn.mockImplementation = (fn) => {
    implementation = fn
    return mockFn
  }
  
  mockFn.mockClear = () => {
    calls.length = 0
  }
  
  Object.defineProperty(mockFn, 'calls', {
    get: () => calls
  })
  
  return mockFn
}

// Mock AuthRepository
export function createMockAuthRepository(): AuthRepository {
  return {
    findAll: createMockFn<AuthRepository['findAll']>(),
    findById: createMockFn<AuthRepository['findById']>(),
    findByEmail: createMockFn<AuthRepository['findByEmail']>(),
    findByGoogleId: createMockFn<AuthRepository['findByGoogleId']>(),
    create: createMockFn<AuthRepository['create']>(),
    update: createMockFn<AuthRepository['update']>(),
    delete: createMockFn<AuthRepository['delete']>(),
    createSession: createMockFn<AuthRepository['createSession']>(),
    deleteSession: createMockFn<AuthRepository['deleteSession']>(),
    linkGoogleAccount: createMockFn<AuthRepository['linkGoogleAccount']>(),
    updateTwoFactorSecret: createMockFn<AuthRepository['updateTwoFactorSecret']>(),
    enableTwoFactor: createMockFn<AuthRepository['enableTwoFactor']>(),
    disableTwoFactor: createMockFn<AuthRepository['disableTwoFactor']>()
  }
}
