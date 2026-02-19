/**
 * Environment Variable Validation
 * 
 * Validates all environment variables at startup using Zod.
 * Throws descriptive error if any required variable is missing or invalid.
 * Prevents runtime errors due to misconfiguration.
 */

import { z } from 'zod'

// Define environment schema with validation rules
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server config
  PORT: z.coerce.number().int().positive().default(3000),
  APP_VERSION: z.string().min(1).default('1.0.0'),
  
  // Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  
  // Google OAuth (optional in dev, required in prod if using Google auth)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Storage
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  
  // Local storage paths
  LOCAL_STORAGE_PATH: z.string().default('./storage'),
  LOCAL_STORAGE_URL: z.string().default('/storage'),
  
  // S3 config (required if STORAGE_DRIVER=s3)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  CDN_URL: z.string().url().optional(),
  
  // Database (optional, defaults to ./db/dev.sqlite)
  DATABASE_URL: z.string().default('./db/dev.sqlite'),
  
  // Backup configuration
  BACKUP_ENABLED: z.enum(['true', 'false']).default('true'),
  BACKUP_INTERVAL_MINUTES: z.coerce.number().int().positive().default(10),
  BACKUP_RETENTION_COUNT: z.coerce.number().int().positive().default(10),
  BACKUP_LOCAL_PATH: z.string().default('./storage/backups'),
  BACKUP_S3_ENABLED: z.enum(['true', 'false']).default('false'),
  BACKUP_S3_PATH: z.string().default('backups/database'),
})

// Type inference
export type Env = z.infer<typeof envSchema>

// Validate and parse environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
      console.error(`\n❌ Environment validation failed:\n${issues}\n`)
      console.error('Please check your .env file and ensure all required variables are set.\n')
      process.exit(1)
    }
    throw error
  }
}

// Singleton - validate once at startup
export const env = validateEnv()

// Helper to check if S3 storage is properly configured
export function isS3Configured(): boolean {
  return (
    env.STORAGE_DRIVER === 's3' &&
    !!env.S3_BUCKET &&
    !!env.S3_REGION &&
    !!env.S3_ENDPOINT &&
    !!env.S3_ACCESS_KEY &&
    !!env.S3_SECRET_KEY
  )
}

// Helper to check if Google OAuth is properly configured
export function isGoogleOAuthConfigured(): boolean {
  return !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET
}

// Helper for backup config
export const backupConfig = {
  enabled: env.BACKUP_ENABLED === 'true',
  intervalMinutes: env.BACKUP_INTERVAL_MINUTES,
  retentionCount: env.BACKUP_RETENTION_COUNT,
  localPath: env.BACKUP_LOCAL_PATH,
  s3Enabled: env.BACKUP_S3_ENABLED === 'true',
  s3Path: env.BACKUP_S3_PATH,
}
