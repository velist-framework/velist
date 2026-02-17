/**
 * S3-Compatible Storage Provider
 * 
 * Supports: AWS S3, Wasabi, MinIO, DigitalOcean Spaces
 * 
 * Env variables required:
 *   S3_BUCKET, S3_REGION, S3_ENDPOINT
 *   S3_ACCESS_KEY, S3_SECRET_KEY
 *   CDN_URL (optional)
 */

import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { StorageProvider } from './index'

export class S3Storage implements StorageProvider {
  private client: S3Client
  private bucket: string
  private cdnUrl?: string

  constructor() {
    this.bucket = process.env.S3_BUCKET!
    this.cdnUrl = process.env.CDN_URL
    
    if (!this.bucket) {
      throw new Error('S3_BUCKET is required')
    }

    this.client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  }

  async upload(key: string, file: File | Buffer, contentType?: string): Promise<void> {
    let buffer: Buffer
    if (file instanceof Buffer) {
      buffer = file
    } else {
      // File is Bun's File type
      buffer = Buffer.from(await (file as File).arrayBuffer())
    }
    
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ACL: 'public-read',
    }))
  }

  async get(key: string): Promise<Buffer> {
    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
    
    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    const reader = (response.Body as ReadableStream).getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    return Buffer.concat(chunks)
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }))
      return true
    } catch {
      return false
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }

  getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl.replace(/\/$/, '')}/${key}`
    }
    const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, '')
    return `${endpoint}/${this.bucket}/${key}`
  }

  /**
   * Generate presigned URL for direct upload from client
   * Client uploads directly to S3, bypassing your server
   */
  async getPresignedUploadUrl(
    key: string, 
    contentType: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    })
    
    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Generate presigned URL for viewing/downloading private files
   */
  async getPresignedDownloadUrl(
    key: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    
    return await getSignedUrl(this.client, command, { expiresIn })
  }
}
