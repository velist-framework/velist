/**
 * Test Database Helper
 * 
 * Provides isolated database for unit tests.
 * Each test gets a fresh in-memory database.
 */
import { Database } from 'bun:sqlite'
import { Kysely, SqliteDialect } from 'kysely'
import type { DatabaseSchema } from '../../../src/features/_core/database/connection'

// In-memory test database
let testDb: Kysely<DatabaseSchema> | null = null

export function getTestDb(): Kysely<DatabaseSchema> {
  if (!testDb) {
    const sqlite = new Database(':memory:')
    
    // Create tables
    sqlite.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        email_verified_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)
    
    testDb = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({ database: sqlite })
    })
  }
  
  return testDb
}

export async function resetTestDb(): Promise<void> {
  if (testDb) {
    await testDb.deleteFrom('sessions').execute().catch(() => {})
    await testDb.deleteFrom('users').execute().catch(() => {})
  }
}

export async function closeTestDb(): Promise<void> {
  if (testDb) {
    await testDb.destroy()
    testDb = null
  }
}
