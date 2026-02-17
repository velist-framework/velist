/**
 * Storage Infrastructure
 * 
 * Abstraction layer for file storage.
 * Supports: Local filesystem, S3-compatible storage
 * 
 * Usage:
 *   const storage = createStorage()
 *   await storage.upload('path/to/file', fileBuffer, 'image/png')
 */

export interface StorageProvider {
  upload(key: string, file: File | Buffer, contentType?: string): Promise<void>
  get(key: string): Promise<Buffer>
  exists(key: string): Promise<boolean>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
  
  // Optional: Presigned URLs (S3 only)
  getPresignedUploadUrl?(key: string, contentType: string, expiresIn?: number): Promise<string>
  getPresignedDownloadUrl?(key: string, expiresIn?: number): Promise<string>
}

/**
 * Factory function to create storage provider based on env
 */
export function createStorage(): StorageProvider {
  const driver = process.env.STORAGE_DRIVER || 'local'
  
  if (driver === 's3') {
    const { S3Storage } = require('./s3')
    return new S3Storage()
  }
  
  const { LocalStorage } = require('./local')
  return new LocalStorage()
}
