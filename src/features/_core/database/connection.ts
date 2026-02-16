import { Kysely, SqliteDialect, type Generated, type Insertable, type Selectable, type Updateable } from 'kysely'
import { Database } from 'bun:sqlite'

// SINGLE SOURCE OF TRUTH - Database Schema
// Semua ID menggunakan UUID v7 (string)
export interface DatabaseSchema {
  users: {
    id: string  // UUID v7
    email: string
    password_hash: string
    name: string
    role: string
    email_verified_at: string | null
    created_at: string
    updated_at: string
  }
  
  sessions: {
    id: string       // UUID v7
    user_id: string  // FK ke users.id (UUID v7)
    ip_address: string | null
    user_agent: string | null
    payload: string
    last_activity: number
  }
  
  password_reset_tokens: {
    email: string
    token: string  // UUID v7
    created_at: string | null
  }
  
  migrations: {
    id: Generated<number>  // Internal use, tetap auto-increment
    name: string
    executed_at: string
  }
}

// Helper types - export untuk digunakan di seluruh app
export type User = Selectable<DatabaseSchema['users']>
export type NewUser = Insertable<DatabaseSchema['users']>
export type UserUpdate = Updateable<DatabaseSchema['users']>

// Transaction type untuk repository
export type Transaction = Kysely<DatabaseSchema>

// Ensure db directory exists
await Bun.write('./db/.keep', '')

// Create single SQLite connection with WAL mode enabled
const sqliteDb = new Database('./db/dev.sqlite', { create: true, readwrite: true })
sqliteDb.exec('PRAGMA journal_mode = WAL;')
sqliteDb.exec('PRAGMA foreign_keys = ON;')

// Singleton instance - use the same connection
export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb as any
  }),
  log(event) {
    if (event.level === 'query' && process.env.NODE_ENV === 'development') {
      console.log(`\x1b[36m[SQL]\x1b[0m ${event.query.sql}`)
    }
  }
})
