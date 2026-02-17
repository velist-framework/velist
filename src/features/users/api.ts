import { Elysia } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { UserService } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const usersApi = new Elysia({ prefix: '/users' })
  .use(cookie())
  .use(jwt({
    secret: process.env.JWT_SECRET || 'your-secret-key',
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
      ;(ctx as any).user = payload as { sub: string; email: string; name: string }
    } catch {
      return inertia.redirect('/auth/login')
    }
  })
  
  .derive(() => ({ userService: new UserService() }))

  // List all users
  .get('/', async (ctx) => {
    const { inertia, userService } = ctx as typeof ctx & { inertia: Inertia }
    const users = await userService.getAll()
    const user = (ctx as any).user
    return inertia.render('users/Index', { users, user })
  })
