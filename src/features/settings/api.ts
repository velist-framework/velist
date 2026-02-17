import { createProtectedApi } from '../_core/auth/protected'

export const settingsApi = createProtectedApi('/settings')

  // Settings page
  .get('/', async (ctx) => {
    const { inertia } = ctx
    const user = (ctx as any).user
    return inertia.render('settings/Index', { user })
  })
