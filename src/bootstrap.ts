/**
 * Application Bootstrap
 * 
 * Production-ready setup with:
 * - Environment validation
 * - Request logging
 * - Rate limiting
 * - Error handling
 * - Health checks
 * - Graceful shutdown
 */

import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'

// Config (must be imported first - validates env vars)
import { env } from './config/env'

// Inertia
import { inertia, type Inertia } from './inertia/plugin'

// Middleware
import { errorHandler } from './features/_core/middleware/errorHandler'
import { requestLogger } from './features/_core/middleware/requestLogger'
import { rateLimits } from './features/_core/middleware/rateLimit'
import { healthCheck } from './features/_core/middleware/healthCheck'
import { gracefulShutdownMiddleware, setServerInstance } from './features/_core/middleware/gracefulShutdown'

// Features
import { authApi } from './features/_core/auth/api'
import { dashboardApi } from './features/dashboard/api'
import { usersApi } from './features/users/api'
import { settingsApi } from './features/settings/api'
import { notificationsApi } from './features/notifications/api'
import { notificationWs } from './features/notifications/ws'
import { backupApi } from './features/backup/api'
import { backupService } from './features/backup/service'

// Database
import { runMigrations } from './features/_core/database/migrations/runner'
import { mkdirSync, existsSync } from 'fs'

// Ensure dist folder exists (for fresh install)
if (!existsSync('./dist')) {
  mkdirSync('./dist', { recursive: true })
}


// Start auto-backup service (silent background process)
if (env.BACKUP_ENABLED) {
  backupService.start()
}

console.log(`🚀 Starting Velist v${env.APP_VERSION} in ${env.NODE_ENV} mode\n`)

const app = new Elysia()
  // Security middleware (production only)
  .use(env.NODE_ENV === 'production' ? helmet() : (a: Elysia) => a)
  .use(env.NODE_ENV === 'production' ? cors({ origin: false, credentials: true }) : (a: Elysia) => a)
  
  // Request logging (skip health checks to reduce noise)
  .use(requestLogger({
    format: env.NODE_ENV === 'production' ? 'json' : 'dev',
    skip: ['/health', '/health/live', '/health/ready']
  }))
  
  // Global error handling
  .use(errorHandler())
  
  // Health check endpoints
  .use(healthCheck())
  
  // Graceful shutdown tracking
  .use(gracefulShutdownMiddleware())
  
  // Rate limiting for auth endpoints (strict - 5 req/minute)
  .use(rateLimits.strict)
  
  // Static files
  .use(staticPlugin({
    assets: './static',
    prefix: '/'
  }))
  .use(staticPlugin({
    assets: './dist',
    prefix: '/dist'
  }))
  
  // Static file serving for storage (uploads)
  .use(staticPlugin({
    assets: env.LOCAL_STORAGE_PATH,
    prefix: env.LOCAL_STORAGE_URL
  }))

  // Mount features
  .use(authApi)
  .use(dashboardApi)
  .use(usersApi)
  .use(settingsApi)
  .use(notificationsApi)
  .use(backupApi)
  
  // Mount WebSocket
  .use(notificationWs)

  // Root redirect
  .get('/', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return new Response('', {
      status: 302,
      headers: { 'Location': '/dashboard' }
    })
  })

  // Catch-all untuk SPA fallback (Inertia)
  .use(inertia())
  .get('*', (ctx) => {
    const { inertia, request } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('errors/404', { 
      path: request.url 
    })
  })

// Start server
const PORT = env.PORT

const server = app.listen(PORT, () => {
  // ANSI color codes
  const bold = '\x1b[1m'
  const green = '\x1b[32m'
  const cyan = '\x1b[36m'
  const yellow = '\x1b[33m'
  const dim = '\x1b[2m'
  const reset = '\x1b[0m'
  
  console.log(`
${green}${bold}╔══════════════════════════════════════════════════════════════╗${reset}
${green}${bold}║                                                              ║${reset}
${green}${bold}║${reset}  🚀 Server running at ${cyan}${bold}http://localhost:${PORT}${reset}${green}${bold}              ║${reset}
${green}${bold}║                                                              ║${reset}
${green}${bold}╚══════════════════════════════════════════════════════════════╝${reset}

📦 Environment: ${yellow}${env.NODE_ENV}${reset}
🔒 JWT Secret: ${dim}${env.JWT_SECRET.substring(0, 8)}...${reset}
💾 Database: ${dim}${env.DATABASE_URL}${reset}
📁 Storage: ${dim}${env.STORAGE_DRIVER} (${env.LOCAL_STORAGE_PATH})${reset}

Health checks:
  • /health       - Comprehensive status
  • /health/live  - Liveness probe  
  • /health/ready - Readiness probe

Press Ctrl+C to stop gracefully
`)
})

// Store server instance for graceful shutdown
setServerInstance(server)

export type App = typeof app
