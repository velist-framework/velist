import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export interface TwoFactorSetupResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
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

    // Encrypt secret before storing (simple encryption with app key)
    const encryptedSecret = await this.encryptSecret(secret.base32)

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
    const secret = await this.decryptSecret(user.two_factor_secret)

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

    const secret = await this.decryptSecret(user.two_factor_secret)

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

  /**
   * Encrypt secret (simple XOR with app key)
   * In production, use proper encryption like AES-256
   */
  private async encryptSecret(secret: string): Promise<string> {
    const key = process.env.JWT_SECRET || 'fallback-key-min-32-chars-long!'
    let encrypted = ''
    for (let i = 0; i < secret.length; i++) {
      encrypted += String.fromCharCode(
        secret.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    return Buffer.from(encrypted).toString('base64')
  }

  /**
   * Decrypt secret
   */
  private async decryptSecret(encrypted: string): Promise<string> {
    const key = process.env.JWT_SECRET || 'fallback-key-min-32-chars-long!'
    const decoded = Buffer.from(encrypted, 'base64').toString()
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      )
    }
    return decrypted
  }
}
