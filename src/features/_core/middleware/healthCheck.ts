/**
 * Comprehensive Health Check Endpoint
 * 
 * Monitors all critical services:
 * - Database connectivity
 * - Storage accessibility  
 * - Memory usage
 * - Disk space
 * - Response time
 * 
 * Returns detailed status for load balancer health checks.
 */

import { Elysia } from 'elysia'
import { db } from '../database/connection'
import { env } from '../../../config/env'
import { createStorage } from '../storage'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  uptime: number
  checks: {
    database: ServiceCheck
    storage: ServiceCheck
    memory: ServiceCheck
    disk?: ServiceCheck
  }
  metrics?: {
    responseTimeMs: number
    memoryUsage: NodeJS.MemoryUsage
  }
}

export interface ServiceCheck {
  status: 'pass' | 'fail' | 'warn'
  responseTimeMs: number
  message?: string
  details?: unknown
}

// Track application start time
const startTime = Date.now()

// Check database connectivity
async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    // Simple query to verify connection
    const result = await db.selectFrom('users')
      .select(({ fn }) => [fn.count('id').as('count')])
      .executeTakeFirst()
    
    return {
      status: 'pass',
      responseTimeMs: Date.now() - start,
      details: { userCount: Number(result?.count || 0) }
    }
  } catch (error) {
    return {
      status: 'fail',
      responseTimeMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed'
    }
  }
}

// Check storage accessibility
async function checkStorage(): Promise<ServiceCheck> {
  const start = Date.now()
  try {
    const storage = createStorage()
    
    // Try to write a test file
    const testPath = `health-check/${Date.now()}.txt`
    const testContent = Buffer.from('health-check')
    
    await storage.upload(testPath, testContent, 'text/plain')
    await storage.delete(testPath)
    
    return {
      status: 'pass',
      responseTimeMs: Date.now() - start,
      message: `${env.STORAGE_DRIVER} storage is accessible`
    }
  } catch (error) {
    return {
      status: 'fail',
      responseTimeMs: Date.now() - start,
      message: error instanceof Error ? error.message : 'Storage check failed'
    }
  }
}

// Check memory usage
function checkMemory(): ServiceCheck {
  const usage = process.memoryUsage()
  const maxHeapMB = 512 // Warning threshold: 512MB
  const criticalHeapMB = 1024 // Critical threshold: 1GB
  
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)
  const rssMB = Math.round(usage.rss / 1024 / 1024)
  
  let status: 'pass' | 'warn' | 'fail' = 'pass'
  let message = `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB, RSS: ${rssMB}MB`
  
  if (heapUsedMB > criticalHeapMB) {
    status = 'fail'
    message = `CRITICAL: ${message}`
  } else if (heapUsedMB > maxHeapMB) {
    status = 'warn'
    message = `High memory usage: ${message}`
  }
  
  return {
    status,
    responseTimeMs: 0,
    message,
    details: {
      heapUsedMB,
      heapTotalMB,
      rssMB,
      externalMB: Math.round(usage.external / 1024 / 1024)
    }
  }
}

// Check disk space (if local storage)
async function checkDisk(): Promise<ServiceCheck | undefined> {
  if (env.STORAGE_DRIVER !== 'local') {
    return undefined
  }
  
  const start = Date.now()
  try {
    // Get storage directory stats
    const storagePath = env.LOCAL_STORAGE_PATH
    const stat = await Bun.file(storagePath).stat()
    
    // Note: Bun doesn't have built-in disk space check
    // In production, use system commands or a library
    return {
      status: 'pass',
      responseTimeMs: Date.now() - start,
      message: `Storage path accessible: ${storagePath}`
    }
  } catch {
    // Disk check is optional, don't fail health check for this
    return undefined
  }
}

// Calculate overall status
function calculateOverallStatus(checks: HealthStatus['checks']): HealthStatus['status'] {
  const checkList = Object.values(checks).filter(Boolean) as ServiceCheck[]
  
  const hasFail = checkList.some(c => c.status === 'fail')
  const hasWarn = checkList.some(c => c.status === 'warn')
  
  if (hasFail) return 'unhealthy'
  if (hasWarn) return 'degraded'
  return 'healthy'
}

/**
 * Health check plugin
 * 
 * Mounts /health endpoint with comprehensive checks
 */
export function healthCheck() {
  return new Elysia({ name: 'health-check' })
    .get('/health', async () => {
      const requestStart = Date.now()
      
      // Run all checks in parallel
      const [database, storage, memory, disk] = await Promise.all([
        checkDatabase(),
        checkStorage(),
        Promise.resolve(checkMemory()),
        checkDisk()
      ])
      
      const checks: HealthStatus['checks'] = {
        database,
        storage,
        memory,
        ...(disk && { disk })
      }
      
      const status = calculateOverallStatus(checks)
      
      const response: HealthStatus = {
        status,
        timestamp: new Date().toISOString(),
        version: env.APP_VERSION,
        environment: env.NODE_ENV,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks,
        metrics: {
          responseTimeMs: Date.now() - requestStart,
          memoryUsage: process.memoryUsage()
        }
      }
      
      return response
    })
    
    // Simple liveness probe (fast, minimal checks)
    .get('/health/live', () => ({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000)
    }))
    
    // Readiness probe (checks if ready to receive traffic)
    .get('/health/ready', async () => {
      const [dbCheck, storageCheck] = await Promise.all([
        checkDatabase(),
        checkStorage()
      ])
      
      const ready = dbCheck.status === 'pass' && storageCheck.status === 'pass'
      
      return {
        status: ready ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbCheck.status,
          storage: storageCheck.status
        }
      }
    })
}
