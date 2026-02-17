/**
 * Image Processing Utilities
 * 
 * Uses Sharp for image manipulation:
 * - Resize
 * - Convert format (webp, jpeg, png)
 * - Compress
 * 
 * Install: bun add sharp
 */

import sharp from 'sharp'

export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number
}

/**
 * Process image with sharp
 */
export async function processImage(
  input: Buffer | File,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    format = 'webp'
  } = options

  // Convert File to Buffer if needed
  let buffer: Buffer
  if (input instanceof Buffer) {
    buffer = input
  } else {
    // File is Bun's File type
    buffer = Buffer.from(await (input as File).arrayBuffer())
  }

  // Build sharp pipeline
  let pipeline = sharp(buffer)
  
  // Resize (fit inside max dimensions)
  pipeline = pipeline.resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true
  })

  // Convert format
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality })
      break
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true })
      break
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 })
      break
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })

  return {
    buffer: data,
    width: info.width,
    height: info.height,
    format: info.format,
    size: data.length
  }
}

/**
 * Check if mime type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(mimeType)
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp'
  }
  return map[mimeType] || 'bin'
}
