import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { cookie } from '@elysiajs/cookie'
import { notificationService } from './notificationService'

// Map untuk menyimpan WebSocket connections per user
const connections = new Map<string, Set<any>>()

/**
 * Broadcast notification to specific user
 */
export function notifyUser(userId: string, notification: {
  id: string
  type: string
  title: string
  message: string
  created_at: string
}) {
  const userConnections = connections.get(userId)
  if (userConnections) {
    const message = JSON.stringify({
      event: 'notification',
      data: notification
    })
    userConnections.forEach(ws => {
      try {
        ws.send(message)
      } catch {
        // Connection might be closed
      }
    })
  }
}

/**
 * Get online users count
 */
export function getOnlineUsersCount(): number {
  return connections.size
}

/**
 * WebSocket notification plugin
 */
export const notificationWs = new Elysia({ prefix: '/ws' })
  .use(cookie())
  .use(jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key',
    exp: '7d'
  }))
  
  // WebSocket endpoint for notifications
  .ws('/notifications', {
    // Authenticate on connection
    async open(ws) {
      try {
        // Get token from query string or cookie
        const token = ws.data.query?.token as string || 
                     (ws.data.cookie as any)?.auth?.value
        
        if (!token) {
          ws.close(4001, 'Unauthorized')
          return
        }
        
        // Verify JWT
        const payload = await (ws.data as any).jwt.verify(token)
        if (!payload || !payload.sub) {
          ws.close(4001, 'Invalid token')
          return
        }
        
        const userId = payload.sub as string
        
        // Store connection
        if (!connections.has(userId)) {
          connections.set(userId, new Set())
        }
        connections.get(userId)!.add(ws)
        
        // Store userId on ws for cleanup
        ;(ws as any).userId = userId
        
        // Send unread count on connect
        const unreadCount = await notificationService.getUnreadCount(userId)
        ws.send(JSON.stringify({
          event: 'connected',
          data: { unreadCount }
        }))
        
        console.log(`[WS] User ${userId} connected. Online: ${connections.size}`)
        
      } catch (error) {
        console.error('[WS] Auth error:', error)
        ws.close(4001, 'Authentication failed')
      }
    },
    
    // Handle messages from client (mark as read, etc)
    async message(ws, message) {
      try {
        const userId = (ws as any).userId
        if (!userId) return
        
        const data = typeof message === 'string' ? JSON.parse(message) : message
        
        switch (data.action) {
          case 'markAsRead':
            if (data.notificationId) {
              await notificationService.markAsRead(data.notificationId, userId)
              ws.send(JSON.stringify({
                event: 'markedAsRead',
                data: { notificationId: data.notificationId }
              }))
            }
            break
            
          case 'markAllAsRead':
            await notificationService.markAllAsRead(userId)
            ws.send(JSON.stringify({
              event: 'markedAllAsRead'
            }))
            break
            
          case 'ping':
            ws.send(JSON.stringify({ event: 'pong' }))
            break
        }
      } catch (error) {
        console.error('[WS] Message error:', error)
      }
    },
    
    // Cleanup on disconnect
    close(ws) {
      const userId = (ws as any).userId
      if (userId) {
        const userConnections = connections.get(userId)
        if (userConnections) {
          userConnections.delete(ws)
          if (userConnections.size === 0) {
            connections.delete(userId)
          }
        }
        console.log(`[WS] User ${userId} disconnected. Online: ${connections.size}`)
      }
    }
  })

// Export for use in other features
export { connections }
