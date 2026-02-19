/**
 * Centralized Error Handling
 * 
 * Provides consistent error responses across the application.
 * Logs errors with full stack traces for debugging.
 * Sanitizes error messages in production.
 */

import { Elysia } from 'elysia'
import { env } from '../../../config/env'

// Custom error classes for different scenarios
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.name = 'RateLimitError'
  }
}

// Error response structure
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  stack?: string
  timestamp: string
  requestId?: string
}

// Generate request ID for tracing
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

// Format error response based on environment
function formatError(error: Error, requestId: string, isInertia: boolean): ErrorResponse {
  const isDev = env.NODE_ENV === 'development'
  
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId
    }
    
    if (isDev) {
      response.stack = error.stack
    }
    
    return response
  }
  
  // Unknown errors - hide details in production
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? error.message : 'An unexpected error occurred'
    },
    timestamp: new Date().toISOString(),
    requestId
  }
  
  if (isDev) {
    response.stack = error.stack
  }
  
  return response
}

// Log error with context
function logError(error: Error, request: Request, requestId: string): void {
  const url = new URL(request.url)
  const timestamp = new Date().toISOString()
  
  console.error(`\n❌ [ERROR] ${timestamp} | Request: ${requestId}`)
  console.error(`   ${request.method} ${url.pathname}${url.search}`)
  console.error(`   ${error.name}: ${error.message}`)
  
  if (error.stack && env.NODE_ENV === 'development') {
    console.error(`   Stack: ${error.stack.split('\n').slice(1, 4).join('\n          ')}`)
  }
  
  // Log additional context for specific error types
  if (error instanceof AppError) {
    console.error(`   Status: ${error.statusCode} | Code: ${error.code}`)
  }
}

/**
 * Global error handling middleware
 * 
 * Usage:
 * ```typescript
 * app.use(errorHandler())
 * 
 * // In routes, throw custom errors:
 * throw new NotFoundError('User')
 * throw new ValidationError('Invalid email format')
 * ```
 */
export function errorHandler() {
  return new Elysia({ name: 'error-handler' })
    .onError(({ code, error, request, set }) => {
      const requestId = generateRequestId()
      const isInertia = request.headers.get('X-Inertia') === 'true'
      
      // Handle different error types
      let appError: AppError
      
      if (error instanceof AppError) {
        appError = error
      } else if (code === 'VALIDATION') {
        // Elysia validation error
        const message = error instanceof Error ? error.message : 'Validation failed'
        appError = new ValidationError(message)
      } else if (code === 'NOT_FOUND') {
        appError = new NotFoundError()
      } else {
        // Unknown error
        const message = error instanceof Error ? error.message : 'Unknown error'
        appError = new AppError(message, 500, 'INTERNAL_ERROR')
      }
      
      // Log the error
      logError(appError, request, requestId)
      
      // Set status code
      set.status = appError.statusCode
      
      // Set security headers
      set.headers['X-Request-Id'] = requestId
      set.headers['X-Content-Type-Options'] = 'nosniff'
      
      // Return formatted error
      const errorResponse = formatError(appError, requestId, isInertia)
      
      // For Inertia requests, return HTML with error page
      if (isInertia) {
        // Inertia will handle the error page
        return errorResponse
      }
      
      return errorResponse
    })
}

/**
 * Async handler wrapper - catches errors in async functions
 * 
 * Usage:
 * ```typescript
 * .get('/', asyncHandler(async (ctx) => {
 *   const data = await riskyOperation()
 *   return data
 * }))
 * ```
 */
export function asyncHandler<T>(fn: (ctx: T) => Promise<unknown>) {
  return async (ctx: T) => {
    try {
      return await fn(ctx)
    } catch (error) {
      // Re-throw to be caught by global error handler
      throw error
    }
  }
}
