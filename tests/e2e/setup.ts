import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';

export async function setupTestDatabase() {
  // Use separate test database
  const testDbPath = './db/test.sqlite';
  
  // Remove old test database
  try {
    await Bun.file(testDbPath).delete();
  } catch {
    // File might not exist
  }
  
  // Create new test database
  const sqlite = new Database(testDbPath, { create: true });
  const db = drizzle(sqlite);
  
  // Run migrations
  await migrate(db, {
    migrationsFolder: join(process.cwd(), 'src/features/_core/database/migrations'),
  });
  
  sqlite.close();
  
  // Set environment variable to use test database
  process.env.DATABASE_URL = testDbPath;
  
  return testDbPath;
}

export async function cleanupTestDatabase() {
  try {
    await Bun.file('./db/test.sqlite').delete();
    await Bun.file('./db/test.sqlite-shm').delete();
    await Bun.file('./db/test.sqlite-wal').delete();
  } catch {
    // Files might not exist
  }
}
