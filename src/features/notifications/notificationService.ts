import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read_at: string | null
  created_at: string
}

export interface CreateNotificationPayload {
  userId: string
  type?: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
}

export class NotificationService {
  /**
   * Create new notification
   */
  async create(payload: CreateNotificationPayload): Promise<Notification> {
    const id = uuidv7()
    const now = new Date().toISOString()
    
    await db
      .insertInto('notifications')
      .values({
        id,
        user_id: payload.userId,
        type: payload.type || 'info',
        title: payload.title,
        message: payload.message,
        read_at: null,
        created_at: now
      })
      .execute()
    
    return {
      id,
      user_id: payload.userId,
      type: payload.type || 'info',
      title: payload.title,
      message: payload.message,
      read_at: null,
      created_at: now
    }
  }
  
  /**
   * Get unread notifications for user
   */
  async getUnread(userId: string): Promise<Notification[]> {
    return db
      .selectFrom('notifications')
      .where('user_id', '=', userId)
      .where('read_at', 'is', null)
      .orderBy('created_at', 'desc')
      .selectAll()
      .execute()
  }
  
  /**
   * Get recent notifications (last 30 days)
   */
  async getRecent(userId: string, limit = 20): Promise<Notification[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return db
      .selectFrom('notifications')
      .where('user_id', '=', userId)
      .where('created_at', '>', thirtyDaysAgo.toISOString())
      .orderBy('created_at', 'desc')
      .limit(limit)
      .selectAll()
      .execute()
  }
  
  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db
      .updateTable('notifications')
      .set({ read_at: new Date().toISOString() })
      .where('id', '=', notificationId)
      .where('user_id', '=', userId)
      .execute()
  }
  
  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db
      .updateTable('notifications')
      .set({ read_at: new Date().toISOString() })
      .where('user_id', '=', userId)
      .where('read_at', 'is', null)
      .execute()
  }
  
  /**
   * Delete notification
   */
  async delete(notificationId: string, userId: string): Promise<void> {
    await db
      .deleteFrom('notifications')
      .where('id', '=', notificationId)
      .where('user_id', '=', userId)
      .execute()
  }
  
  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .selectFrom('notifications')
      .where('user_id', '=', userId)
      .where('read_at', 'is', null)
      .select(({ fn }) => fn.count('id').as('count'))
      .executeTakeFirst()
    
    return Number(result?.count || 0)
  }
}

// Singleton instance
export const notificationService = new NotificationService()
