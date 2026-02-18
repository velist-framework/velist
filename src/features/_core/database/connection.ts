import { Kysely, type Generated, type Insertable, type Selectable, type Updateable } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'
import { Database } from 'bun:sqlite'

// SINGLE SOURCE OF TRUTH - Database Schema
export interface DatabaseSchema {
  users: {
    id: string
    email: string
    password_hash: string
    name: string
    role: string
    google_id: string | null
    email_verified_at: string | null
    two_factor_secret: string | null
    two_factor_enabled: number // 0 = false, 1 = true
    two_factor_confirmed_at: string | null
    created_at: string
    updated_at: string
  }
  
  sessions: {
    id: string
    user_id: string
    ip_address: string | null
    user_agent: string | null
    payload: string
    last_activity: number
  }
  
  password_reset_tokens: {
    email: string
    token: string
    created_at: string | null
  }
  
  two_factor_backup_codes: {
    id: string
    user_id: string
    code_hash: string
    used_at: string | null
    created_at: string
  }
  
  notifications: {
    id: string
    user_id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    read_at: string | null
    created_at: string
  }
  
  assets: {
    id: string
    user_id: string
    filename: string
    original_name: string
    mime_type: string
    size: number
    path: string
    url: string
    metadata: string | null
    created_at: string
  }
}

export type User = Selectable<DatabaseSchema['users']>
export type NewUser = Insertable<DatabaseSchema['users']>
export type UserUpdate = Updateable<DatabaseSchema['users']>

export type Transaction = Kysely<DatabaseSchema>

// Ensure db directory exists
await Bun.write('./db/.keep', '')

// Create SQLite connection using kysely-bun-sqlite
const dbPath = process.env.DATABASE_URL || './db/dev.sqlite'
const sqliteDb = new Database(dbPath, { create: true })

// Enable foreign keys
sqliteDb.exec('PRAGMA foreign_keys = ON;')

// Singleton instance with BunSqliteDialect
export const db = new Kysely<DatabaseSchema>({
  dialect: new BunSqliteDialect({
    database: sqliteDb
  }),
  log(event) {
    if (event.level === 'query' && process.env.NODE_ENV === 'development') {
      console.log(`[SQL] ${event.query.sql}`)
    }
  }
})
