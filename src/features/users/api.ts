import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { UserService } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const usersApi = new Elysia({ prefix: '/users' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  .derive(() => ({ userService: new UserService() }))

  // List all users
  .get('/', async (ctx) => {
    const { inertia, userService } = ctx as typeof ctx & { inertia: Inertia }
    const users = await userService.getAll()
    return inertia.render('users/Index', { users })
  })
