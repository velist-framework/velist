import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'
import { env } from '../../config/env'

export interface TwoFactorSetupResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

/**
 * Encryption utilities using AES-256-GCM
 * Format: iv:authTag:ciphertext (all base64url encoded, separated by ':')
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  // Derive AES-256 key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-256-GCM
 * Returns: base64(salt):base64(iv):base64(authTag):base64(ciphertext)
 */
async function encryptAES256(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  
  // Generate random salt (16 bytes) and IV (12 bytes for GCM)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // Derive key
  const key = await deriveKey(password, salt)
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    data
  )
  
  // Extract auth tag (last 16 bytes) and ciphertext
  const encryptedArray = new Uint8Array(encrypted)
  const ciphertext = encryptedArray.slice(0, -16)
  const authTag = encryptedArray.slice(-16)
  
  // Encode all parts as base64
  const toBase64 = (arr: Uint8Array) => btoa(String.fromCharCode(...arr))
  
  return `${toBase64(salt)}:${toBase64(iv)}:${toBase64(authTag)}:${toBase64(ciphertext)}`
}

/**
 * Decrypt data using AES-256-GCM
 * Input format: base64(salt):base64(iv):base64(authTag):base64(ciphertext)
 */
async function decryptAES256(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder()
  
  // Decode base64
  const fromBase64 = (str: string) => {
    const binary = atob(str)
    return new Uint8Array(binary.split('').map(c => c.charCodeAt(0)))
  }
  
  const parts = encryptedData.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format')
  }
  
  const [saltB64, ivB64, authTagB64, ciphertextB64] = parts
  
  const salt = fromBase64(saltB64)
  const iv = fromBase64(ivB64)
  const authTag = fromBase64(authTagB64)
  const ciphertext = fromBase64(ciphertextB64)
  
  // Derive key
  const key = await deriveKey(password, salt)
  
  // Combine ciphertext and auth tag for Web Crypto API
  const encrypted = new Uint8Array(ciphertext.length + authTag.length)
  encrypted.set(ciphertext)
  encrypted.set(authTag, ciphertext.length)
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encrypted
  )
  
  return decoder.decode(decrypted)
}

/**
 * Get encryption key from environment
 * Falls back to JWT_SECRET only in development (with warning)
 */
function getEncryptionKey(): string {
  if (env.ENCRYPTION_KEY) {
    return env.ENCRYPTION_KEY
  }
  
  // Fallback to JWT_SECRET only in development
  if (env.NODE_ENV === 'development') {
    console.warn('[2FA] Warning: Using JWT_SECRET as fallback for encryption. Set ENCRYPTION_KEY in production!')
    return env.JWT_SECRET
  }
  
  throw new Error('ENCRYPTION_KEY is required in production environment')
}

export class TwoFactorService {
  /**
   * Generate new 2FA secret and QR code
   */
  async generateSecret(userId: string, email: string): Promise<TwoFactorSetupResult> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Velist:${email}`,
      length: 32
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Generate 10 backup codes
    const backupCodes = this.generateBackupCodes()

    // Encrypt secret before storing (AES-256-GCM)
    const encryptionKey = getEncryptionKey()
    const encryptedSecret = await encryptAES256(secret.base32, encryptionKey)

    // Save encrypted secret to user (but not enabled yet)
    await db
      .updateTable('users')
      .set({
        two_factor_secret: encryptedSecret,
        two_factor_enabled: 0,
        two_factor_confirmed_at: null,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute()

    // Save hashed backup codes
    await this.saveBackupCodes(userId, backupCodes)

    return {
      secret: secret.base32, // Show once to user
      qrCodeUrl,
      backupCodes
    }
  }

  /**
   * Verify TOTP code and enable 2FA
   */
  async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    // Get user with secret
    const user = await db
      .selectFrom('users')
      .where('id', '=', userId)
      .select(['two_factor_secret'])
      .executeTakeFirst()

    if (!user?.two_factor_secret) {
      return false
    }

    // Decrypt secret
    const encryptionKey = getEncryptionKey()
    const secret = await decryptAES256(user.two_factor_secret, encryptionKey)

    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 time step tolerance
    })

    if (verified) {
      // Enable 2FA
      await db
        .updateTable('users')
        .set({
          two_factor_enabled: 1,
          two_factor_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where('id', '=', userId)
        .execute()
    }

    return verified
  }

  /**
   * Verify TOTP code during login
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await db
      .selectFrom('users')
      .where('id', '=', userId)
      .select(['two_factor_secret', 'two_factor_enabled'])
      .executeTakeFirst()

    if (!user?.two_factor_enabled || !user.two_factor_secret) {
      return false
    }

    const encryptionKey = getEncryptionKey()
    const secret = await decryptAES256(user.two_factor_secret, encryptionKey)

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1
    })
  }

  /**
   * Verify and use backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    // Get unused backup codes for user
    const codes = await db
      .selectFrom('two_factor_backup_codes')
      .where('user_id', '=', userId)
      .where('used_at', 'is', null)
      .select(['id', 'code_hash'])
      .execute()

    // Find matching code
    for (const backup of codes) {
      const isMatch = await Bun.password.verify(code, backup.code_hash)
      if (isMatch) {
        // Mark as used
        await db
          .updateTable('two_factor_backup_codes')
          .set({ used_at: new Date().toISOString() })
          .where('id', '=', backup.id)
          .execute()
        return true
      }
    }

    return false
  }

  /**
   * Disable 2FA
   */
  async disable(userId: string): Promise<void> {
    // Delete backup codes
    await db
      .deleteFrom('two_factor_backup_codes')
      .where('user_id', '=', userId)
      .execute()

    // Disable 2FA
    await db
      .updateTable('users')
      .set({
        two_factor_secret: null,
        two_factor_enabled: 0,
        two_factor_confirmed_at: null,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute()
  }

  /**
   * Generate 10 random backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      // Format: XXXX-XXXX-XXXX (16 chars)
      const code = Array.from({ length: 3 }, () => 
        Math.random().toString(36).substring(2, 6).toUpperCase()
      ).join('-')
      codes.push(code)
    }
    return codes
  }

  /**
   * Save hashed backup codes
   */
  private async saveBackupCodes(userId: string, codes: string[]): Promise<void> {
    // Delete old codes first
    await db
      .deleteFrom('two_factor_backup_codes')
      .where('user_id', '=', userId)
      .execute()

    // Insert new codes
    const now = new Date().toISOString()
    for (const code of codes) {
      const hash = await Bun.password.hash(code)
      await db
        .insertInto('two_factor_backup_codes')
        .values({
          id: uuidv7(),
          user_id: userId,
          code_hash: hash,
          used_at: null,
          created_at: now
        })
        .execute()
    }
  }
}
