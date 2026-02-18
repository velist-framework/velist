import { t } from 'elysia'
import { createProtectedApi } from '../_core/auth/protected'
import { db } from '../_core/database/connection'
import { TwoFactorService } from './twoFactorService'

const twoFactorService = new TwoFactorService()

async function getUserWith2FA(userId: string) {
  return db
    .selectFrom('users')
    .where('id', '=', userId)
    .select(['id', 'email', 'name', 'two_factor_enabled'])
    .executeTakeFirst()
}

export const settingsApi = createProtectedApi('/settings')

  // Settings page
  .get('/', async (ctx) => {
    const { inertia } = ctx
    const userId = (ctx as any).user.sub
    
    const user = await getUserWith2FA(userId)
    console.log(user)
    
    return inertia.render('settings/Index', { 
      user,
      twoFactorEnabled: user?.two_factor_enabled === 1
    })
  })

  // Update profile
  .put('/profile', async (ctx) => {
    const { body, inertia } = ctx
    const userId = (ctx as any).user.sub

    // Update name
    await db
      .updateTable('users')
      .set({
        name: body.name,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute()

    // Get updated user
    const user = await getUserWith2FA(userId)

    return inertia.render('settings/Index', {
      user,
      twoFactorEnabled: user?.two_factor_enabled === 1,
      status: 'Profile updated successfully'
    })
  }, {
    body: t.Object({
      name: t.String({ minLength: 2, maxLength: 255 })
    })
  })

  // Update password
  .put('/password', async (ctx) => {
    const { body, inertia } = ctx
    const userId = (ctx as any).user.sub

    // Get user with password
    const dbUser = await db
      .selectFrom('users')
      .where('id', '=', userId)
      .selectAll()
      .executeTakeFirst()

    const user = await getUserWith2FA(userId)

    if (!dbUser) {
      return inertia.render('settings/Index', {
        user,
        errors: { current_password: 'User not found' }
      })
    }

    // Verify current password
    const isValid = await Bun.password.verify(body.current_password, dbUser.password_hash)
    if (!isValid) {
      return inertia.render('settings/Index', {
        user,
        errors: { current_password: 'Current password is incorrect' }
      })
    }

    // Hash new password
    const hashedPassword = await Bun.password.hash(body.password)

    // Update password
    await db
      .updateTable('users')
      .set({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute()

    return inertia.render('settings/Index', {
      user,
      status: 'Password updated successfully'
    })
  }, {
    body: t.Object({
      current_password: t.String({ minLength: 1 }),
      password: t.String({ minLength: 8 }),
      password_confirmation: t.String({ minLength: 8 })
    })
  })

  // 2FA: Setup page (GET)
  .get('/2fa/setup', async (ctx) => {
    const { inertia } = ctx
    const userId = (ctx as any).user.sub
    const email = (ctx as any).user.email

    try {
      const setup = await twoFactorService.generateSecret(userId, email)

      return inertia.render('settings/TwoFactorSetup', {
        user: await getUserWith2FA(userId),
        qrCode: setup.qrCodeUrl,
        secret: setup.secret,
        backupCodes: setup.backupCodes
      })
    } catch (error) {
      return inertia.render('settings/Index', {
        user: await getUserWith2FA(userId),
        twoFactorEnabled: false,
        errors: { two_factor: 'Failed to setup 2FA' }
      })
    }
  })

  // 2FA: Setup (POST - for inertia form)
  .post('/2fa/setup', async (ctx) => {
    const { inertia } = ctx
    const userId = (ctx as any).user.sub
    const email = (ctx as any).user.email

    try {
      const setup = await twoFactorService.generateSecret(userId, email)

      return inertia.render('settings/TwoFactorSetup', {
        user: await getUserWith2FA(userId),
        qrCode: setup.qrCodeUrl,
        secret: setup.secret,
        backupCodes: setup.backupCodes
      })
    } catch (error) {
      return inertia.render('settings/Index', {
        user: await getUserWith2FA(userId),
        twoFactorEnabled: false,
        errors: { two_factor: 'Failed to setup 2FA' }
      })
    }
  })

  // 2FA: Verify and enable
  .post('/2fa/verify', async (ctx) => {
    const { body, inertia } = ctx
    const userId = (ctx as any).user.sub

    const verified = await twoFactorService.verifyAndEnable(userId, body.code)

    const user = await getUserWith2FA(userId)

    if (verified) {
      return inertia.render('settings/Index', {
        user,
        twoFactorEnabled: true,
        status: 'Two-factor authentication enabled successfully'
      })
    }

    return inertia.render('settings/Index', {
      user,
      twoFactorEnabled: false,
      errors: { two_factor: 'Invalid verification code' }
    })
  }, {
    body: t.Object({
      code: t.String({ minLength: 6, maxLength: 6 })
    })
  })

  // 2FA: Disable
  .delete('/2fa', async (ctx) => {
    const { inertia } = ctx
    const userId = (ctx as any).user.sub

    await twoFactorService.disable(userId)

    const user = await getUserWith2FA(userId)

    return inertia.render('settings/Index', {
      user,
      twoFactorEnabled: false,
      status: 'Two-factor authentication disabled'
    })
  })
