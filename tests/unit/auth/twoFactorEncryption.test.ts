/**
 * 2FA Encryption Unit Tests
 * 
 * Tests for AES-256-GCM encryption/decryption functions
 */
import { describe, it, expect } from 'bun:test'

/**
 * Copy of encryption functions from twoFactorService for testing
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptAES256(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const key = await deriveKey(password, salt)
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  )
  
  const encryptedArray = new Uint8Array(encrypted)
  const ciphertext = encryptedArray.slice(0, -16)
  const authTag = encryptedArray.slice(-16)
  
  const toBase64 = (arr: Uint8Array) => btoa(String.fromCharCode(...arr))
  
  return `${toBase64(salt)}:${toBase64(iv)}:${toBase64(authTag)}:${toBase64(ciphertext)}`
}

async function decryptAES256(encryptedData: string, password: string): Promise<string> {
  const decoder = new TextDecoder()
  
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
  
  const key = await deriveKey(password, salt)
  
  const encrypted = new Uint8Array(ciphertext.length + authTag.length)
  encrypted.set(ciphertext)
  encrypted.set(authTag, ciphertext.length)
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  )
  
  return decoder.decode(decrypted)
}

describe('AES-256-GCM Encryption', () => {
  it('should encrypt and decrypt correctly with same key', async () => {
    const plaintext = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP' // Base32 secret
    const password = 'my-secret-encryption-key-32-chars!'
    
    const encrypted = await encryptAES256(plaintext, password)
    const decrypted = await decryptAES256(encrypted, password)
    
    expect(decrypted).toBe(plaintext)
  })

  it('should produce different ciphertext for same plaintext (random IV)', async () => {
    const plaintext = 'test-secret-data'
    const password = 'encryption-key-32-chars-long!!!!!!'
    
    const encrypted1 = await encryptAES256(plaintext, password)
    const encrypted2 = await encryptAES256(plaintext, password)
    
    // Should be different due to random salt and IV
    expect(encrypted1).not.toBe(encrypted2)
    
    // But both should decrypt to same plaintext
    expect(await decryptAES256(encrypted1, password)).toBe(plaintext)
    expect(await decryptAES256(encrypted2, password)).toBe(plaintext)
  })

  it('should fail to decrypt with wrong password', async () => {
    const plaintext = 'sensitive-2fa-secret-data'
    const correctPassword = 'correct-key-32-chars-long!!!!!!'
    const wrongPassword = 'wrong-key-32-chars-long!!!!!!!!!'
    
    const encrypted = await encryptAES256(plaintext, correctPassword)
    
    // Should throw when decrypting with wrong key
    await expect(decryptAES256(encrypted, wrongPassword)).rejects.toThrow()
  })

  it('should fail to decrypt tampered ciphertext', async () => {
    const plaintext = 'important-secret-data'
    const password = 'secure-password-32-chars-long!!!'
    
    const encrypted = await encryptAES256(plaintext, password)
    const parts = encrypted.split(':')
    
    // Tamper with the ciphertext
    const tamperedCiphertext = btoa(atob(parts[3]) + 'X')
    const tamperedEncrypted = `${parts[0]}:${parts[1]}:${parts[2]}:${tamperedCiphertext}`
    
    // Should throw due to auth tag verification failure
    await expect(decryptAES256(tamperedEncrypted, password)).rejects.toThrow()
  })

  it('should handle empty string', async () => {
    const plaintext = ''
    const password = 'test-key-32-chars-for-testing!!!!'
    
    const encrypted = await encryptAES256(plaintext, password)
    const decrypted = await decryptAES256(encrypted, password)
    
    expect(decrypted).toBe(plaintext)
  })

  it('should handle long secrets', async () => {
    const plaintext = 'A'.repeat(1000)
    const password = 'long-secret-key-32-chars-long!!!'
    
    const encrypted = await encryptAES256(plaintext, password)
    const decrypted = await decryptAES256(encrypted, password)
    
    expect(decrypted).toBe(plaintext)
  })

  it('should have correct format (4 base64 parts)', async () => {
    const plaintext = 'test'
    const password = 'format-test-key-32-chars-long!!!'
    
    const encrypted = await encryptAES256(plaintext, password)
    const parts = encrypted.split(':')
    
    expect(parts).toHaveLength(4)
    
    // Each part should be valid base64
    for (const part of parts) {
      expect(() => atob(part)).not.toThrow()
    }
  })

  it('should throw on invalid format', async () => {
    const password = 'test-key-32-chars-for-testing!!!!'
    
    await expect(decryptAES256('invalid', password))
      .rejects.toThrow('Invalid encrypted data format')
    
    await expect(decryptAES256('a:b:c', password))
      .rejects.toThrow('Invalid encrypted data format')
  })
})

describe('Encryption Key Requirements', () => {
  it('should work with exactly 32 character key', async () => {
    const plaintext = 'test'
    const password = '12345678901234567890123456789012' // exactly 32 chars
    
    const encrypted = await encryptAES256(plaintext, password)
    const decrypted = await decryptAES256(encrypted, password)
    
    expect(decrypted).toBe(plaintext)
  })

  it('should work with longer keys', async () => {
    const plaintext = 'test'
    const password = 'this-is-a-very-long-password-that-exceeds-32-chars'
    
    const encrypted = await encryptAES256(plaintext, password)
    const decrypted = await decryptAES256(encrypted, password)
    
    expect(decrypted).toBe(plaintext)
  })
})
