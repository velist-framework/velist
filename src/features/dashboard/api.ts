import { createProtectedApi } from '../_core/auth/protected'

export const dashboardApi = createProtectedApi('/dashboard')

  // GET /dashboard - Main dashboard page
  .get('/', (ctx) => {
    const { inertia } = ctx
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
