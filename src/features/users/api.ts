import { createProtectedApi } from '../_core/auth/protected'
import { UserService } from './service'

export const usersApi = createProtectedApi('/users')
  .derive(() => ({ userService: new UserService() }))

  // List all users
  .get('/', async (ctx) => {
    const { inertia, userService } = ctx
    const users = await userService.getAll()
    const user = (ctx as any).user
    return inertia.render('users/Index', { users, user })
  })
