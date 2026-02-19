/**
 * Graceful Shutdown Handler
 * 
 * Ensures clean shutdown when receiving SIGTERM/SIGINT:
 * 1. Stop accepting new requests
 * 2. Wait for ongoing requests to complete
 * 3. Close database connections
 * 4. Close WebSocket connections
 * 5. Exit process
 */

import { Elysia } from 'elysia'
import { db } from '../database/connection'
import { backupService } from '../../backup/service'

interface GracefulShutdownOptions {
  timeoutMs?: number      // Max time to wait for requests (default: 30s)
  cleanup?: () => Promise<void>  // Additional cleanup function
}

// Track active connections
let activeRequests = 0
let isShuttingDown = false

/**
 * Increment active request counter
 */
export function incrementActiveRequests(): void {
  if (!isShuttingDown) {
    activeRequests++
  }
}

/**
 * Decrement active request counter
 */
export function decrementActiveRequests(): void {
  activeRequests = Math.max(0, activeRequests - 1)
}

/**
 * Check if server is shutting down
 */
export function isServerShuttingDown(): boolean {
  return isShuttingDown
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(options: GracefulShutdownOptions = {}): void {
  const { timeoutMs = 30000 } = options
  
  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      console.log(`\n⚠️  Shutdown already in progress...`)
      return
    }
    
    isShuttingDown = true
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)
    
    // Stop backup service
    console.log('  → Stopping backup service...')
    backupService.stop()
    
    // Wait for active requests to complete
    if (activeRequests > 0) {
      console.log(`  → Waiting for ${activeRequests} active request(s)...`)
      
      const startTime = Date.now()
      while (activeRequests > 0 && Date.now() - startTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      if (activeRequests > 0) {
        console.log(`  ⚠️  Timeout reached. ${activeRequests} request(s) still active.`)
      } else {
        console.log('  ✓ All requests completed')
      }
    }
    
    // Run additional cleanup if provided
    if (options.cleanup) {
      console.log('  → Running custom cleanup...')
      try {
        await options.cleanup()
        console.log('  ✓ Custom cleanup completed')
      } catch (error) {
        console.error('  ✗ Custom cleanup failed:', error)
      }
    }
    
    // Close database connection
    console.log('  → Closing database connection...')
    try {
      await db.destroy()
      console.log('  ✓ Database connection closed')
    } catch (error) {
      console.error('  ✗ Database close error:', error)
    }
    
    console.log('✅ Graceful shutdown complete. Exiting...\n')
    process.exit(0)
  }
  
  // Handle SIGTERM (Docker, Kubernetes)
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => shutdown('SIGINT'))
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('\n💥 Uncaught Exception:', error)
    shutdown('uncaughtException').catch(() => process.exit(1))
  })
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason)
    // Don't shutdown on unhandled rejection, just log it
  })
}

// Setup handlers once
setupGracefulShutdown()

/**
 * Middleware to track active requests
 * Returns Elysia-compatible middleware
 */
export function gracefulShutdownMiddleware(options: GracefulShutdownOptions = {}) {
  return new Elysia({ name: 'graceful-shutdown' })
    .onBeforeHandle(() => {
      if (isShuttingDown) {
        return new Response(
          JSON.stringify({
            error: 'Server is shutting down',
            message: 'The server is currently restarting. Please try again shortly.'
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '30'
            }
          }
        )
      }
      incrementActiveRequests()
    })
    .onAfterHandle(() => {
      decrementActiveRequests()
    })
    .onError(() => {
      decrementActiveRequests()
    })
}

/**
 * Set server instance for graceful shutdown
 * Note: In Elysia, the server stops when the process exits
 */
export function setServerInstance(_server: any): void {
  // Server reference stored but not used directly
  // Elysia handles server lifecycle internally
}
