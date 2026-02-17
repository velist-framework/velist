import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID v7
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  googleId: text('google_id').unique(),
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

// Assets table for file uploads
export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  metadata: text('metadata'), // JSON: { width, height, format }
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
