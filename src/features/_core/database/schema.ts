import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID v7
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  emailVerifiedAt: text('email_verified_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // UUID v7
  userId: text('user_id').notNull().references(() => users.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  payload: text('payload').notNull(),
  lastActivity: integer('last_activity').notNull(),
});

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  email: text('email').primaryKey(),
  token: text('token').notNull(),
  createdAt: text('created_at'),
});
