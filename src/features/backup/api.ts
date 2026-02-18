import { t } from 'elysia'
import { createProtectedApi } from '../_core/auth/protected'
import { backupService } from './service'
import { db } from '../_core/database/connection'

export const backupApi = createProtectedApi('/backup')



  // GET /backup - Backup management page
  .get('/', async (ctx) => {
    const { inertia } = ctx
    const user = (ctx as any).user
    
    const backups = await backupService.getBackups()
    const config = backupService.getConfig()
    
    // Get database stats
    const dbPath = process.env.DATABASE_URL || './db/dev.sqlite'
    const dbSize = (await Bun.file(dbPath).stat())?.size || 0
    
    return inertia.render('backup/Index', {
      user,
      backups,
      config,
      dbSize
    })
  })

  // POST /backup/now - Trigger manual backup
  .post('/now', async (ctx) => {
    const { inertia } = ctx
    
    const result = await backupService.performBackup()
    
    const backups = await backupService.getBackups()
    const config = backupService.getConfig()
    const dbPath = process.env.DATABASE_URL || './db/dev.sqlite'
    const dbSize = (await Bun.file(dbPath).stat())?.size || 0
    
    return inertia.render('backup/Index', {
      user: (ctx as any).user,
      backups,
      config,
      dbSize,
      lastResult: result
    })
  })

  // POST /backup/config - Update backup config
  .post('/config', async (ctx) => {
    const { body, inertia } = ctx
    
    backupService.updateConfig({
      enabled: body.enabled,
      intervalMinutes: body.intervalMinutes,
      retentionCount: body.retentionCount,
      s3Enabled: body.s3Enabled
    })
    
    const backups = await backupService.getBackups()
    const config = backupService.getConfig()
    const dbPath = process.env.DATABASE_URL || './db/dev.sqlite'
    const dbSize = (await Bun.file(dbPath).stat())?.size || 0
    
    return inertia.render('backup/Index', {
      user: (ctx as any).user,
      backups,
      config,
      dbSize,
      status: 'Configuration updated'
    })
  }, {
    body: t.Object({
      enabled: t.Boolean(),
      intervalMinutes: t.Number({ minimum: 1, maximum: 1440 }),
      retentionCount: t.Number({ minimum: 1, maximum: 100 }),
      s3Enabled: t.Boolean()
    })
  })

  // DELETE /backup/:filename - Delete a backup
  .delete('/:filename', async (ctx) => {
    const { params, inertia } = ctx
    const fs = await import('fs/promises')
    const path = backupService.getBackupPath(params.filename)
    
    try {
      await fs.unlink(path)
    } catch (error) {
      console.error('[Backup] Delete failed:', error)
    }
    
    return inertia.redirect('/backup')
  })

  // POST /backup/restore/:filename - Restore from backup (admin only)
  .post('/restore/:filename', async (ctx) => {
    const { params, inertia } = ctx
    const user = (ctx as any).user
    
    // Only admin can restore
    if (user.role !== 'admin') {
      return inertia.render('errors/403', { 
        message: 'Only admin can restore database' 
      })
    }
    
    // TODO: Implement restore logic
    // This would replace current database with backup
    // Very dangerous operation - needs confirmation
    
    return inertia.render('backup/Index', {
      user,
      backups: await backupService.getBackups(),
      config: backupService.getConfig(),
      dbSize: 0,
      error: 'Restore not implemented yet. Please restore manually.'
    })
  })
