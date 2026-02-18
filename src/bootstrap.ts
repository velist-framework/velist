import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static' 
import { inertia, type Inertia } from './inertia/plugin'
import { authApi } from './features/_core/auth/api'
import { dashboardApi } from './features/dashboard/api'
import { usersApi } from './features/users/api'
import { settingsApi } from './features/settings/api'
import { notificationsApi } from './features/notifications/api'
import { notificationWs } from './features/notifications/ws'
import { backupApi } from './features/backup/api'
import { runMigrations } from './features/_core/database/migrations/runner'

// Run migrations on startup (dev only)
if (process.env.NODE_ENV !== 'production') {
  await runMigrations()
}

const app = new Elysia() 
 
  
  // Health check
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // Benchmark endpoints - Hello World
  .get('/bench/text', () => 'Hello World')
  .get('/bench/json', () => ({ message : 'Hello World' }))
  
  .use(staticPlugin({
    assets: './static',
    prefix: '/'
  }))
  // Serve built assets in production
  .use(staticPlugin({
    assets: './dist',
    prefix: '/dist'
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
      headers: {
        'Location': '/dashboard'
      }
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
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🦊 Elysia is running at http://localhost:${PORT}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export type App = typeof app
