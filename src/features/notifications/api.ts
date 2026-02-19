import { t } from 'elysia'
import { createProtectedApi } from '../_core/auth/protected'
import { notificationService } from './notificationService'
import { notifyUser } from './ws'

export const notificationsApi = createProtectedApi('/notifications')

  // Get notifications page
  .get('/', async (ctx) => {
    const { inertia } = ctx
    const user = (ctx as any).user
    
    const notifications = await notificationService.getRecent(user.sub)
    const unreadCount = await notificationService.getUnreadCount(user.sub)
    
    return inertia.render('notifications/Index', {
      user: { id: user.sub, email: user.email, name: user.name },
      notifications,
      unreadCount
    })
  })

  // Get recent notifications (for dropdown)
  .get('/recent', async (ctx) => {
    const { inertia } = ctx
    const userId = (ctx as any).user.sub
    
    const notifications = await notificationService.getRecent(userId, 10)
    const unreadCount = await notificationService.getUnreadCount(userId)
    
    return inertia.render('notifications/Dropdown', {
      notifications,
      unreadCount
    })
  })

  // Mark as read
  .put('/:id/read', async (ctx) => {
    const { params, inertia } = ctx
    const userId = (ctx as any).user.sub
    
    await notificationService.markAsRead(params.id, userId)
    
    return inertia.render('notifications/Index', {
      notifications: await notificationService.getRecent(userId),
      unreadCount: await notificationService.getUnreadCount(userId)
    })
  })

  // Mark all as read
  .put('/read-all', async (ctx) => {
    const { inertia } = ctx
    const userId = (ctx as any).user.sub
    
    await notificationService.markAllAsRead(userId)
    
    return inertia.render('notifications/Index', {
      notifications: await notificationService.getRecent(userId),
      unreadCount: 0
    })
  })

  // Delete notification
  .delete('/:id', async (ctx) => {
    const { params, inertia } = ctx
    const userId = (ctx as any).user.sub
    
    await notificationService.delete(params.id, userId)
    
    return inertia.render('notifications/Index', {
      notifications: await notificationService.getRecent(userId),
      unreadCount: await notificationService.getUnreadCount(userId)
    })
  })

  // Send test notification to self
  .post('/send', async (ctx) => {
    const { body, inertia } = ctx
    const userId = (ctx as any).user.sub
    
    const notification = await notificationService.create({
      userId,
      type: body.type,
      title: body.title,
      message: body.message
    })
    
    // Broadcast via WebSocket
    notifyUser(userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      created_at: notification.created_at
    })
    
    return { success: true }
  }, {
    body: t.Object({
      type: t.Union([
        t.Literal('info'),
        t.Literal('success'),
        t.Literal('warning'),
        t.Literal('error')
      ]),
      title: t.String(),
      message: t.String()
    })
  })

// Helper function to send notification (for use in other features)
export async function sendNotification({
  userId,
  type = 'info',
  title,
  message
}: {
  userId: string
  type?: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
}) {
  // Save to database
  const notification = await notificationService.create({
    userId,
    type,
    title,
    message
  })
  
  // Broadcast via WebSocket
  notifyUser(userId, {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    created_at: notification.created_at
  })
  
  return notification
}
