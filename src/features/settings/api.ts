import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { inertia, type Inertia } from '../../inertia/plugin'

export const settingsApi = new Elysia({ prefix: '/settings' })
  .use(authApi)
  .auth(true)
  .use(inertia())

  // Settings page
  .get('/', async (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    const user = (ctx as any).user
    return inertia.render('settings/Index', { user })
  })
