/**
 * Error Handling Middleware Tests
 */
import { describe, it, expect } from 'bun:test'
import { errorHandler, AppError, ValidationError, NotFoundError, AuthenticationError } from '../../../src/features/_core/middleware/errorHandler'

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Something went wrong')
      
      expect(error.message).toBe('Something went wrong')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
    })

    it('should create error with custom values', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_ERROR')
      
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('CUSTOM_ERROR')
    })
  })

  describe('Specific Error Types', () => {
    it('ValidationError should have 400 status', () => {
      const error = new ValidationError('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('NotFoundError should have 404 status', () => {
      const error = new NotFoundError('User')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('User not found')
    })

    it('AuthenticationError should have 401 status', () => {
      const error = new AuthenticationError()
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('AUTHENTICATION_ERROR')
    })
  })

  describe('errorHandler middleware', () => {
    it('should return an Elysia plugin', () => {
      const handler = errorHandler()
      expect(handler).toBeDefined()
      expect(handler.config).toBeDefined()
      expect(handler.config.name).toBe('error-handler')
    })
  })
})
