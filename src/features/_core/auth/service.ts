import { AuthRepository } from './repository'
import type { NewUser } from '../database/connection'
import type { GoogleUserInfo } from './google'

import { t, type Static } from 'elysia'

// TypeBox Schemas - digunakan untuk validation & type inference
export const LoginSchema = t.Object({
  email: t.String({ format: 'email', maxLength: 255 }),
  password: t.String({ minLength: 8, maxLength: 255 }),
  remember: t.Optional(t.Boolean({ default: false }))
})

export const RegisterSchema = t.Object({
  email: t.String({ format: 'email', maxLength: 255 }),
  password: t.String({ minLength: 8, maxLength: 255 }),
  password_confirmation: t.String({ minLength: 8 }),
  name: t.String({ minLength: 2, maxLength: 100 })
}, {
  additionalProperties: false
})

export type LoginPayload = Static<typeof LoginSchema>
export type RegisterPayload = Static<typeof RegisterSchema>

// Safe user type (without password)
export type SafeUser = Omit<NewUser, 'password_hash'> & { 
  id: string; 
  role: string
  two_factor_enabled?: number
  two_factor_secret?: string | null
}

export class AuthService {
  constructor(private repo: AuthRepository = new AuthRepository()) {}

  async register(payload: RegisterPayload): Promise<SafeUser> {
    // Validasi password match
    if (payload.password !== payload.password_confirmation) {
      throw new Error('Password confirmation does not match')
    }

    // Check existing
    const existing = await this.repo.findByEmail(payload.email)
    if (existing) {
      throw new Error('Email already registered')
    }

    // Hash password using Bun
    const passwordHash = await Bun.password.hash(payload.password, {
      algorithm: 'bcrypt',
      cost: 10 // adjustable
    })

    // Create user
    const user = await this.repo.create({
      email: payload.email,
      name: payload.name,
      password_hash: passwordHash,
      email_verified_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as unknown as NewUser)

    // Return safe user (exclude password)
    const { password_hash, ...safeUser } = user
    return safeUser as SafeUser
  }

  async attempt(email: string, password: string): Promise<SafeUser> {
    const user = await this.repo.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const valid = await Bun.password.verify(password, user.password_hash)
    if (!valid) {
      throw new Error('Invalid credentials')
    }

    const { password_hash, ...safeUser } = user
    return safeUser as SafeUser
  }

  async logout(token: string): Promise<void> {
    await this.repo.deleteSession(token)
  }

  // Google OAuth handlers
  async findOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<SafeUser> {
    // Try to find user by Google ID first
    let user = await this.repo.findByGoogleId(googleUser.id)
    
    if (user) {
      const { password_hash, ...safeUser } = user
      return safeUser as SafeUser
    }

    // Try to find by email for linking
    user = await this.repo.findByEmail(googleUser.email)
    
    if (user) {
      // Link Google account to existing user
      await this.repo.linkGoogleAccount(user.id, googleUser.id)
      const { password_hash, ...safeUser } = user
      return safeUser as SafeUser
    }

    // Create new user from Google data
    const newUser = await this.repo.create({
      email: googleUser.email,
      name: googleUser.name,
      google_id: googleUser.id,
      email_verified_at: googleUser.email_verified ? new Date().toISOString() : null
    })

    const { password_hash, ...safeUser } = newUser
    return safeUser as SafeUser
  }
}
