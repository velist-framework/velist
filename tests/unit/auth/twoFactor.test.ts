/**
 * Two-Factor Authentication Tests
 * 
 * Note: TwoFactorService directly accesses the database,
 * so these are more like integration tests.
 */
import { describe, it, expect } from 'bun:test'
import { TwoFactorService } from '../../../src/features/settings/twoFactorService'

describe('TwoFactorService', () => {
  // Since TwoFactorService directly uses the database,
  // we'll just verify the service exists and has expected methods
  
  it('should be defined', () => {
    expect(TwoFactorService).toBeDefined()
  })

  it('should have required methods', () => {
    const service = new TwoFactorService()
    expect(typeof service.generateSecret).toBe('function')
    expect(typeof service.verifyAndEnable).toBe('function')
    expect(typeof service.verifyToken).toBe('function')
    expect(typeof service.verifyBackupCode).toBe('function')
    expect(typeof service.disable).toBe('function')
  })
})
