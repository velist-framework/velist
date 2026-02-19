/**
 * Request Logging Middleware
 * 
 * Logs all HTTP requests with:
 - Method, path, status code, response time
 * - User agent, IP address
 * - User ID (if authenticated)
 * - Error details (if failed)
 * 
 * Supports structured logging for log aggregation tools.
 */

import { Elysia } from 'elysia'
import { env } from '../../../config/env'

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  method: string
  path: string
  statusCode: number
  responseTimeMs: number
  contentLength?: number
  ip: string
  userAgent?: string
  userId?: string
  error?: string
  requestId: string
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`
}

// Get color for status code
function getStatusColor(status: number): string {
  if (status >= 500) return colors.red
  if (status >= 400) return colors.yellow
  if (status >= 300) return colors.cyan
  if (status >= 200) return colors.green
  return colors.gray
}

// Get color for method
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET': return colors.blue
    case 'POST': return colors.green
    case 'PUT': return colors.yellow
    case 'PATCH': return colors.cyan
    case 'DELETE': return colors.red
    default: return colors.gray
  }
}

// Format bytes to human readable
function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`
}

// Parse user agent to get browser info
function parseUserAgent(ua?: string): string {
  if (!ua) return '-'
  
  if (ua.includes('curl')) return 'curl'
  if (ua.includes('Postman')) return 'postman'
  if (ua.includes('Mozilla')) {
    if (ua.includes('Chrome')) return 'chrome'
    if (ua.includes('Safari')) return 'safari'
    if (ua.includes('Firefox')) return 'firefox'
    if (ua.includes('Edge')) return 'edge'
    return 'browser'
  }
  return 'other'
}

// Get client IP
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Console logger (human readable)
function logToConsole(entry: LogEntry): void {
  const methodColor = getMethodColor(entry.method)
  const statusColor = getStatusColor(entry.statusCode)
  const levelColor = entry.level === 'error' ? colors.red : 
                     entry.level === 'warn' ? colors.yellow : colors.green
  
  const timestamp = new Date(entry.timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  const logParts = [
    `${colors.gray}${timestamp}${colors.reset}`,
    `${methodColor}${entry.method.padEnd(6)}${colors.reset}`,
    `${statusColor}${entry.statusCode}${colors.reset}`,
    `${entry.responseTimeMs.toString().padStart(4)}ms`,
    `${formatBytes(entry.contentLength).padStart(6)}`,
    `${entry.path.substring(0, 50).padEnd(50)}`,
    `${colors.gray}${parseUserAgent(entry.userAgent)}${colors.reset}`
  ]
  
  // Add user info if available
  if (entry.userId) {
    logParts.push(`${colors.cyan}user:${entry.userId.substring(0, 8)}${colors.reset}`)
  }
  
  // Add error info if failed
  if (entry.error) {
    logParts.push(`${colors.red}[${entry.error}]${colors.reset}`)
  }
  
  console.log(logParts.join(' '))
}

// JSON logger (structured for log aggregation)
function logToJSON(entry: LogEntry): void {
  console.log(JSON.stringify(entry))
}

// Determine log level from status code
function getLogLevel(status: number): LogEntry['level'] {
  if (status >= 500) return 'error'
  if (status >= 400) return 'warn'
  return 'info'
}

/**
 * Request logging middleware
 * 
 * Usage:
 * ```typescript
 * app.use(requestLogger({
 *   format: 'combined',  // 'combined' | 'dev' | 'json'
 *   skip: ['/health']    // Paths to skip
 * }))
 * ```
 */
export interface RequestLoggerOptions {
  format?: 'dev' | 'combined' | 'json'
  skip?: string[]  // Paths to skip logging
}

export function requestLogger(options: RequestLoggerOptions = {}) {
  const { format = 'dev', skip = ['/health', '/health/live', '/health/ready'] } = options
  
  return new Elysia({ name: 'request-logger' })
    .onRequest(({ request }) => {
      // Attach request metadata
      const url = new URL(request.url)
      
      // Skip health check endpoints to reduce noise
      if (skip.some(path => url.pathname.startsWith(path))) {
        return
      }
      
      // Store request start time and ID
      ;(request as any).__requestStart = Date.now()
      ;(request as any).__requestId = generateRequestId()
    })
    .onAfterHandle(({ request, set, response }) => {
      const url = new URL(request.url)
      
      // Skip health check endpoints
      if (options.skip?.some(path => url.pathname.startsWith(path))) {
        return
      }
      
      const requestStart = (request as any).__requestStart || Date.now()
      const requestId = (request as any).__requestId || generateRequestId()
      
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: getLogLevel(set.status as number),
        method: request.method,
        path: url.pathname + url.search,
        statusCode: set.status as number,
        responseTimeMs: Date.now() - requestStart,
        contentLength: response ? JSON.stringify(response).length : undefined,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        userId: (request as any).__userId,
        requestId
      }
      
      if (format === 'json') {
        logToJSON(entry)
      } else {
        logToConsole(entry)
      }
    })
    .onError(({ request, set, error }) => {
      const url = new URL(request.url)
      
      const requestStart = (request as any).__requestStart || Date.now()
      const requestId = (request as any).__requestId || generateRequestId()
      
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        method: request.method,
        path: url.pathname + url.search,
        statusCode: (set.status as number) || 500,
        responseTimeMs: Date.now() - requestStart,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        userId: (request as any).__userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId
      }
      
      if (format === 'json') {
        logToJSON(entry)
      } else {
        logToConsole(entry)
      }
    })
}

/**
 * Attach user ID to request for logging
 * 
 * Use in auth middleware after user is authenticated
 */
export function attachUserForLogging(userId: string): void {
  // This will be called in auth context
  const request = (global as any).__currentRequest
  if (request) {
    ;(request as any).__userId = userId
  }
}
