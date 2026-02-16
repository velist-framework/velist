import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'
// import { helmet } from 'elysia-helmet' // DISABLED for development
import { inertia, type Inertia } from './inertia/plugin'
import { authApi } from './features/_core/auth/api'
import { dashboardApi } from './features/dashboard/api'
import { runMigrations } from './features/_core/database/migrations/runner'

// Run migrations on startup (dev only)
if (process.env.NODE_ENV !== 'production') {
  await runMigrations()
}

const app = new Elysia()
  // .use(helmet()) // DISABLED - CSP blocking scripts
  .use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
