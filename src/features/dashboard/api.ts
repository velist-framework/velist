import { Elysia, t } from 'elysia'
import { authApi } from '../_core/auth/api'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { inertia, type Inertia } from '../../inertia/plugin'

// Extend Elysia context
declare module 'elysia' {
  interface ElysiaInstance {
    inertia: Inertia
    user: {
      id: string  // UUID v7
      email: string
      name: string
    } | null
  }
}

// Re-export authApi untuk compose
export const dashboardApi = new Elysia({ prefix: '/dashboard' })
  .use(cookie())
  .use(jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    exp: '7d'
  }))
  .use(inertia())
  
  // Auth middleware untuk dashboard
  .onBeforeHandle(async (ctx) => {
    const { cookie, jwt, inertia } = ctx as typeof ctx & { inertia: Inertia }
    const token = (cookie.auth as { value?: string }).value
    if (!token) {
      return inertia.redirect('/auth/login')
    }
    
    try {
      const payload = await jwt.verify(token)
      // Attach user to context
      ;(ctx as any).user = payload as { sub: string; email: string; name: string }
    } catch {
      return inertia.redirect('/auth/login')
    }
  })

  // GET /dashboard - Main dashboard page
  .get('/', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    const user = (ctx as any).user
    return inertia.render('dashboard/Index', {
      user,
      stats: {
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0
      }
    })
  })

  // API endpoint untuk data dashboard (optional - untuk AJAX requests)
  .get('/api/stats', (ctx) => {
    return {
      user: (ctx as any).user,
      stats: {
        totalUsers: 150,
        totalOrders: 45,
        revenue: 12500,
        lastUpdated: new Date().toISOString()
      }
    }
  })
