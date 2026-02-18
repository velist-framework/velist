import { t } from 'elysia'
import { createProtectedApi } from '../_core/auth/protected'
import { sendNotification } from '../notifications/api'

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

  // API endpoint untuk kirim notifikasi demo
  .post('/api/notifications/send', async (ctx) => {
    const { body } = ctx
    const userId = (ctx as any).user.sub
    
    const notification = await sendNotification({
      userId,
      type: body.type,
      title: body.title,
      message: body.message
    })
    
    return { success: true, notification }
  }, {
    body: t.Object({
      type: t.Union([t.Literal('info'), t.Literal('success'), t.Literal('warning'), t.Literal('error')]),
      title: t.String(),
      message: t.String()
    })
  })
