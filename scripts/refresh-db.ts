#!/usr/bin/env bun
/**
 * Database Refresh Script
 * 
 * Hapus database files (sqlite, shm, wal) kemudian jalankan migrate dan seed
 * Usage: bun run refresh
 */

import { unlink } from 'node:fs/promises';

const DB_PATH = './db/dev.sqlite';

async function deleteFile(path: string) {
  try {
    await unlink(path);
    console.log(`  🗑️  Deleted: ${path}`);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(`  ⚠️  Error deleting ${path}:`, err.message);
    } else {
      console.log(`  ⏭️  Not found: ${path}`);
    }
  }
}

async function refresh() {
  console.log('🔄 Refreshing database...\n');
  
  // Step 1: Delete all database files
  console.log('📁 Cleaning up database files:');
  await deleteFile(DB_PATH);
  await deleteFile(`${DB_PATH}-shm`);
  await deleteFile(`${DB_PATH}-wal`);
  
  // Step 2: Run migrations
  console.log('\n📦 Running migrations...');
  const migrationProc = Bun.spawn(['bun', 'run', 'db:migrate'], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const migrationExit = await migrationProc.exited;
  
  if (migrationExit !== 0) {
    console.error('\n❌ Migration failed!');
    process.exit(1);
  }
  
  // Step 3: Run seeder
  console.log('\n🌱 Running seeder...');
  const seederProc = Bun.spawn(['bun', 'run', 'db:seed'], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  const seederExit = await seederProc.exited;
  
  if (seederExit !== 0) {
    console.error('\n❌ Seeding failed!');
    process.exit(1);
  }
  
  console.log('\n✅ Database refreshed successfully!');
}

refresh().catch((error) => {
  console.error('❌ Refresh failed:', error);
  process.exit(1);
});
