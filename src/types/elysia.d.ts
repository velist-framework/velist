/**
 * Velist - Elysia Type Declarations
 */

import type { Elysia } from 'elysia'
import type { Inertia } from '../inertia/plugin'
import type { SafeUser } from './inertia'

export interface AppContext {
  inertia: Inertia
}

export interface ElysiaContext {
  user?: SafeUser
  token?: string
}

declare module 'elysia' {
  interface Elysia {
    /**
     * Authentication macro
     * @param required - Whether authentication is required (default: true)
     */
    auth(required?: boolean): Elysia
  }
  
  interface Context {
    /**
     * Authenticated user (set by auth middleware)
     */
    user?: SafeUser
    /**
     * JWT token (set by auth middleware)
     */
    token?: string
  }
}

export {}
