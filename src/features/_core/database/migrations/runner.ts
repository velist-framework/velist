import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { join } from 'node:path';

export async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    
    const sqlite = new Database('./db/dev.sqlite', { create: true });
    const db = drizzle(sqlite);
    
    await migrate(db, {
      migrationsFolder: join(process.cwd(), 'src/features/_core/database/migrations'),
    });
    
    console.log('✅ Migrations completed');
    
    sqlite.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.main) {
  await runMigrations();
  process.exit(0);
}
