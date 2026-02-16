import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/features/_core/database/schema.ts',
  out: './src/features/_core/database/migrations',
  dbCredentials: {
    url: './db/dev.sqlite',
  },
});
