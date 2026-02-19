import { Elysia } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { inertia, type Inertia } from '../../../inertia/plugin'
import { env } from '../../../config/env'

/**
 * Create a protected Elysia instance with authentication middleware
 * Use this for all protected routes instead of repeating auth setup
 * 
 * Example:
 * ```typescript
 * export const usersApi = createProtectedApi('/users')
 *   .get('/', async (ctx) => {
 *     const user = (ctx as any).user
 *     return ctx.inertia.render('users/Index', { user })
 *   })
 * ```
 */
export function createProtectedApi(prefix: string) {
  return new Elysia({ prefix })
    .use(cookie())
    .use(jwt({
      secret: env.JWT_SECRET,
      exp: '7d'
    }))
    .use(inertia())
    
    // Auth middleware - require authentication
    .onBeforeHandle(async (ctx) => {
      const { cookie, jwt, inertia } = ctx as typeof ctx & { inertia: Inertia }
      const token = (cookie.auth as { value?: string }).value
      if (!token) {
        return inertia.redirect('/auth/login')
      }
      
      try {
        const payload = await jwt.verify(token)
        // Attach user to context
        ;(ctx as any).user = payload as { sub: string; email: string; name: string; role: string }
      } catch {
        return inertia.redirect('/auth/login')
      }
    })
}

/**
 * Type helper untuk context yang sudah ter-authenticate
 * Gunakan ini untuk type casting di route handlers
 */
export interface ProtectedContext {
  user: {
    sub: string
    email: string
    name: string
    role: string
  }
  inertia: Inertia
}
