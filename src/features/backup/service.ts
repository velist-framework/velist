import { Database } from 'bun:sqlite'
import { existsSync, mkdirSync } from 'fs'
import { copyFile, readdir, stat, unlink } from 'fs/promises'
import { join, basename } from 'path'
import { createStorage } from '../_core/storage'
import { backupConfig, env } from '../../config/env'

export interface BackupConfig {
  enabled: boolean
  intervalMinutes: number
  retentionCount: number
  localPath: string
  s3Enabled: boolean
  s3Path?: string
}

export class BackupService {
  private config: BackupConfig
  private dbPath: string
  private timer: Timer | null = null

  constructor(config: Partial<BackupConfig> = {}) {
    // Use environment config as base, allow override
    this.config = {
      enabled: config.enabled ?? backupConfig.enabled,
      intervalMinutes: config.intervalMinutes ?? backupConfig.intervalMinutes,
      retentionCount: config.retentionCount ?? backupConfig.retentionCount,
      localPath: config.localPath ?? backupConfig.localPath,
      s3Enabled: config.s3Enabled ?? backupConfig.s3Enabled,
      s3Path: config.s3Path ?? backupConfig.s3Path
    }
    
    this.dbPath = env.DATABASE_URL
    
    // Ensure backup directory exists
    if (!existsSync(this.config.localPath)) {
      mkdirSync(this.config.localPath, { recursive: true })
    }
  }

  /**
   * Start auto-backup scheduler
   */
  start(): void {
    if (!this.config.enabled || this.timer) return
    
    console.log(`[Backup] Auto-backup started. Interval: ${this.config.intervalMinutes} minutes`)
    
    // Run immediately on start
    this.performBackup()
    
    // Schedule next backups
    this.timer = setInterval(() => {
      this.performBackup()
    }, this.config.intervalMinutes * 60 * 1000)
  }

  /**
   * Stop auto-backup scheduler
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
      console.log('[Backup] Auto-backup stopped')
    }
  }

  /**
   * Perform backup (silent - no notifications)
   */
  async performBackup(): Promise<{
    success: boolean
    filename: string
    size: number
    s3Uploaded?: boolean
    error?: string
  }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.sqlite`
    const backupPath = join(this.config.localPath, filename)

    try {
      // Step 1: Checkpoint WAL to merge all data into main database
      await this.checkpointWal()

      // Step 2: Copy database file
      await copyFile(this.dbPath, backupPath)

      // Step 3: Convert backup to single-file mode (remove WAL mode)
      await this.convertToSingleFile(backupPath)

      // Get backup size
      const stats = await stat(backupPath)

      // Step 4: Upload to S3 if enabled
      let s3Uploaded = false
      if (this.config.s3Enabled && this.config.s3Path) {
        try {
          await this.uploadToS3(backupPath, filename)
          s3Uploaded = true
        } catch (error) {
          console.error('[Backup] S3 upload failed:', error)
        }
      }

      // Step 5: Cleanup old backups
      await this.cleanupOldBackups()

      console.log(`[Backup] Success: ${filename} (${this.formatBytes(stats.size)})`)

      // Log success (silent - no user notification needed)
      console.log(`[Backup] Completed: ${filename} (${this.formatBytes(stats.size)})`)

      return {
        success: true,
        filename,
        size: stats.size,
        s3Uploaded
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Backup] Failed:', errorMsg)

      // Log error (silent - no user notification needed)
      console.error(`[Backup] Failed: ${errorMsg}`)

      return {
        success: false,
        filename,
        size: 0,
        error: errorMsg
      }
    }
  }

  /**
   * Checkpoint WAL - merge WAL data into main database
   */
  private async checkpointWal(): Promise<void> {
    const db = new Database(this.dbPath)
    try {
      // TRUNCATE mode: checkpoint and delete WAL files
      db.exec("PRAGMA wal_checkpoint(TRUNCATE)")
    } finally {
      db.close()
    }
  }

  /**
   * Convert backup to single-file mode (DELETE journal mode)
   * Note: We skip VACUUM to avoid long-running operations
   * The backup is already consistent after checkpoint
   */
  private async convertToSingleFile(backupPath: string): Promise<void> {
    const db = new Database(backupPath)
    try {
      // Switch to DELETE mode (single file, no WAL)
      // This is fast and doesn't lock the original database
      db.exec("PRAGMA journal_mode=DELETE")
      // Note: We intentionally skip VACUUM to keep backup fast
      // The database is already consistent after checkpoint
    } finally {
      db.close()
    }
  }

  /**
   * Upload backup to S3
   */
  private async uploadToS3(localPath: string, filename: string): Promise<void> {
    const storage = createStorage()
    const file = Bun.file(localPath)
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const s3Key = `${this.config.s3Path}/${filename}`
    await storage.upload(s3Key, buffer, 'application/x-sqlite3')
    
    console.log(`[Backup] Uploaded to S3: ${s3Key}`)
  }

  /**
   * Cleanup old backups, keep only retentionCount
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await readdir(this.config.localPath)
      const backupFiles = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.sqlite'))
        .map(f => ({
          name: f,
          path: join(this.config.localPath, f),
          time: stat(join(this.config.localPath, f))
        }))

      // Sort by time (oldest first)
      const sorted = (await Promise.all(
        backupFiles.map(async f => ({
          ...f,
          stat: await f.time
        }))
      )).sort((a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime())

      // Delete old backups
      if (sorted.length > this.config.retentionCount) {
        const toDelete = sorted.slice(0, sorted.length - this.config.retentionCount)
        for (const file of toDelete) {
          await unlink(file.path)
          console.log(`[Backup] Deleted old backup: ${file.name}`)
        }
      }
    } catch (error) {
      console.error('[Backup] Cleanup failed:', error)
    }
  }

  /**
   * Get list of available backups
   */
  async getBackups(): Promise<Array<{
    filename: string
    size: number
    createdAt: Date
  }>> {
    try {
      const files = await readdir(this.config.localPath)
      const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.sqlite'))

      const backups = await Promise.all(
        backupFiles.map(async f => {
          const path = join(this.config.localPath, f)
          const stats = await stat(path)
          return {
            filename: f,
            size: stats.size,
            createdAt: stats.mtime
          }
        })
      )

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch {
      return []
    }
  }

  /**
   * Get backup file path
   */
  getBackupPath(filename: string): string {
    return join(this.config.localPath, filename)
  }

  /**
   * Get current config
   */
  getConfig(): BackupConfig {
    return { ...this.config }
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Restart if interval changed
    if (config.intervalMinutes && this.timer) {
      this.stop()
      this.start()
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Singleton instance with config from env
export const backupService = new BackupService({
  enabled: process.env.BACKUP_ENABLED !== 'false',
  intervalMinutes: parseInt(process.env.BACKUP_INTERVAL_MINUTES || '10'),
  retentionCount: parseInt(process.env.BACKUP_RETENTION_COUNT || '10'),
  localPath: process.env.BACKUP_LOCAL_PATH || './storage/backups',
  s3Enabled: process.env.BACKUP_S3_ENABLED === 'true',
  s3Path: process.env.BACKUP_S3_PATH || 'backups/database'
})
