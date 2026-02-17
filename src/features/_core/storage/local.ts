/**
 * Local Filesystem Storage Provider
 * 
 * Stores files on local disk.
 * Good for: Development, small deployments
 */

import { writeFile, readFile, access, unlink, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import type { StorageProvider } from './index'

export class LocalStorage implements StorageProvider {
  private basePath: string
  private publicUrl: string

  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || './storage'
    this.publicUrl = process.env.LOCAL_STORAGE_URL || '/storage'
  }

  async upload(key: string, file: File | Buffer, contentType?: string): Promise<void> {
    const filePath = join(this.basePath, key)
    await mkdir(dirname(filePath), { recursive: true })
    
    if (file instanceof Buffer) {
      await writeFile(filePath, file)
    } else {
      // BunFile
      await Bun.write(filePath, file)
    }
  }

  async get(key: string): Promise<Buffer> {
    const filePath = join(this.basePath, key)
    return readFile(filePath)
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(join(this.basePath, key))
      return true
    } catch {
      return false
    }
  }

  async delete(key: string): Promise<void> {
    await unlink(join(this.basePath, key))
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl.replace(/\/$/, '')}/${key}`
  }
}
