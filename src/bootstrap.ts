import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'
// import { helmet } from 'elysia-helmet' // DISABLED for development
import { inertia, type Inertia } from './inertia/plugin'
import { authApi } from './features/_core/auth/api'
import { dashboardApi } from './features/dashboard/api'
import { runMigrations } from './features/_core/database/migrations/runner'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Cache for vite URL
let cachedViteUrl: string | null = null
let lastCheck = 0
const CACHE_TTL = 1000 // 1 second

// Get Vite URL for CORS - check env first, then temp file, then default
function getViteUrl(): string {
  if (process.env.VITE_URL) {
    return process.env.VITE_URL
  }
  
  // Use cache if recent
  const now = Date.now()
  if (cachedViteUrl && (now - lastCheck) < CACHE_TTL) {
    return cachedViteUrl
  }
  
  // Try to read from temp file (set by Vite plugin)
  const tempFile = resolve(process.cwd(), '.vite-port')
  if (existsSync(tempFile)) {
    try {
      const url = readFileSync(tempFile, 'utf-8').trim()
      if (url) {
        cachedViteUrl = url
        lastCheck = now
        return url
      }
    } catch {
      // ignore
    }
  }
  
  return 'http://localhost:5173'
}

// Run migrations on startup (dev only)
if (process.env.NODE_ENV !== 'production') {
  await runMigrations()
}

const app = new Elysia()
  // .use(helmet()) // DISABLED - CSP blocking scripts
  .use(cors({
    origin: (request: Request): boolean => {
      const origin = request.headers.get('origin')
      if (!origin) return true
      
      // In production, only allow same origin
      if (process.env.NODE_ENV === 'production') {
        return true
      }
      
      // In development, allow localhost with any port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return true
      }
      
      // Also check against VITE_URL if set
      const viteUrl = process.env.VITE_URL
      if (viteUrl && origin === viteUrl) {
        return true
      }
      
      return false
    },
    credentials: true
  }))
  .use(staticPlugin({
    assets: './static',
    prefix: '/'
  }))
  // Serve built assets in production
  .use(staticPlugin({
    assets: './dist',
    prefix: '/dist'
  }))
  .use(inertia())
  
  // Health check
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Mount features
  .use(authApi)
  .use(dashboardApi)
  
  // Root redirect
  .get('/', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.redirect('/dashboard')
  })
  
  // Catch-all untuk SPA fallback (Inertia)
  .get('*', (ctx) => {
    const { inertia, request } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('errors/404', { 
      path: request.url 
    })
  })

// Start server
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🦊 Elysia is running at http://localhost:${PORT}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export type App = typeof app
