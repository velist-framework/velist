import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { users } from './schema';
import { uuidv7 } from '../../../shared/lib/uuid';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  const sqlite = new Database('./db/dev.sqlite');
  const db = drizzle(sqlite);

  // Check if admin exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, 'admin@example.com'))
    .get();

  if (existing) {
    console.log('  ✓ Admin user already exists');
  } else {
    // Create admin user
    const passwordHash = await Bun.password.hash('password123', {
      algorithm: 'bcrypt',
      cost: 10,
    });

    await db.insert(users).values({
      id: uuidv7(),
      email: 'admin@example.com',
      name: 'Administrator',
      role: 'admin',
      passwordHash: passwordHash,
      emailVerifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('  ✓ Admin user created (admin@example.com / password123)');
  }

  console.log('✅ Seeding completed');
  sqlite.close();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
