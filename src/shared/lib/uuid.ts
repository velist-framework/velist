/**
 * UUID v7 Generator
 * 
 * UUID v7 structure (128 bits):
 * - 48 bits: Unix timestamp (milliseconds since epoch)
 * - 4 bits: Version (0111 = 7)
 * - 12 bits: rand_a (random)
 * - 2 bits: Variant (10)
 * - 62 bits: rand_b (random)
 * 
 * Format: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
 * where y = 8, 9, a, or b (variant bits)
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Generate a UUID v7 string
 */
export function uuidv7(): string {
  // Get timestamp in milliseconds
  const timestamp = Date.now()
  
  // Create buffer for 16 bytes
  const bytes = new Uint8Array(16)
  
  // Write timestamp (48 bits = 6 bytes) in big-endian
  bytes[0] = (timestamp >> 40) & 0xff
  bytes[1] = (timestamp >> 32) & 0xff
  bytes[2] = (timestamp >> 24) & 0xff
  bytes[3] = (timestamp >> 16) & 0xff
  bytes[4] = (timestamp >> 8) & 0xff
  bytes[5] = timestamp & 0xff
  
  // Fill remaining bytes with random values
  const randomBytes = crypto.getRandomValues(new Uint8Array(10))
  
  // Copy random bytes
  for (let i = 0; i < 10; i++) {
    bytes[6 + i] = randomBytes[i]
  }
  
  // Set version (4 bits) = 7 (0111)
  // byte 6: high nibble is version
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  
  // Set variant (2 bits) = 10 (RFC 4122 variant)
  // byte 8: high 2 bits are variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  
  // Convert to hex string with dashes
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0'))
  
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
}

/**
 * Validate UUID v7 format
 */
export function isValidUuidv7(uuid: string): boolean {
  return UUID_REGEX.test(uuid)
}

/**
 * Extract timestamp from UUID v7
 */
export function getTimestampFromUuidv7(uuid: string): Date | null {
  if (!isValidUuidv7(uuid)) return null
  
  // Remove dashes and take first 12 hex chars (48 bits)
  const hex = uuid.replace(/-/g, '').slice(0, 12)
  const timestamp = parseInt(hex, 16)
  
  return new Date(timestamp)
}

/**
 * Generate a short ID (URL-safe, 22 chars base64url)
 * Alternative untuk cases yang butuh ID pendek
 */
export function shortId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
