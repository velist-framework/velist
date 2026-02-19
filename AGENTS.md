# Velist - Agent Guide

**Ve**rtical + L**ist** — Features-first fullstack framework

Stack: Elysia + Inertia.js + Svelte + Kysely

A full-stack TypeScript framework built on Bun with vertical feature slicing architecture, running on Bun runtime.

> **🤖 For AI Assistants**: This file contains critical context for code generation. Always follow the patterns below.

---

## Quick Decision Matrix

| If user asks for... | Do this... |
|---------------------|------------|
| New feature/module | Create vertical slice: `features/[name]/api.ts, service.ts, repository.ts, pages/*.svelte` |
| Database changes | Update `DatabaseSchema` → `bun run db:generate` → `bun run db:migrate` |
| UI components | Inline Tailwind classes, NO component abstraction |
| Complex reusable UI (Modal, DataTable) | `src/shared/components/[Name].svelte` |
| Toast notification | `toast.success('message')` from `$shared/lib/toast` |
| Debounce search input | `debounce(fn, 300)` from `$shared/lib/debounce` |
| Export to CSV | `downloadCSV(filename, data)` from `$shared/lib/csv` |
| Image processing | `processImage(file)` from `$shared/lib/image` |
| Form validation | TypeBox schema in service.ts |
| Authentication | Use `createProtectedApi()` helper |

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Bun | JavaScript runtime, package manager, bundler |
| Backend | Elysia | Web framework with type-safe validation |
| Frontend | Svelte 5 | Reactive UI with runes |
| SPA Bridge | Inertia.js 2 | Backend-rendered SPAs without API |
| Database | bun:sqlite | SQLite embedded in Bun |
| Query Builder | Kysely | Type-safe SQL queries at runtime |
| Migrations | Drizzle ORM | Schema management and migrations |
| File Storage | AWS SDK S3 | Local/S3-compatible storage |
| Image Processing | Sharp | Resize, convert, compress images |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Icons | lucide-svelte | Tree-shakeable icon library |
| Unit Testing | bun:test | Built-in Bun test runner |
| E2E Testing | Playwright | Critical flows only (requires Node.js) |

---

## Project Structure

```
src/
├── bootstrap.ts              # Application entry point
├── features/                 # Vertical feature slices
│   ├── _core/               # Core infrastructure
│   │   ├── auth/            # Authentication feature
│   │   │   ├── api.ts           # Elysia routes
│   │   │   ├── service.ts       # Business logic
│   │   │   ├── repository.ts    # Database access
│   │   │   ├── components/      # Shared auth components
│   │   │   └── pages/           # Svelte pages
│   │   │       ├── Login.svelte
│   │   │       └── Register.svelte
│   │   ├── database/
│   │   │   ├── connection.ts    # Kysely instance
│   │   │   ├── schema.ts        # Drizzle schema
│   │   │   ├── seeder.ts        # Database seeder
│   │   │   └── migrations/
│   │   │       ├── runner.ts
│   │   │       └── *.sql
│   │   └── storage/             # File storage abstraction
│   │       ├── index.ts         # Storage interface & factory
│   │       ├── local.ts         # Local filesystem storage
│   │       └── s3.ts            # S3-compatible storage
│   ├── dashboard/           # Example feature
│   │   ├── api.ts
│   │   └── pages/
│   │       └── Index.svelte
│   └── errors/              # Error pages
│       └── pages/
│           └── 404.svelte
├── inertia/                 # Inertia.js integration
│   ├── plugin.ts           # Custom Elysia-Inertia adapter
│   └── app.ts              # Client-side bootstrap
├── shared/                  # Cross-cutting concerns
│   ├── lib/                # Utilities
│   │   └── uuid.ts         # UUID v7 generator
│   └── styles/
│       └── app.css         # Tailwind entry
└── types/
    └── elysia.d.ts         # Type declarations
```

### Key Rules (NEVER BREAK THESE)

1. **One folder = One feature**: All code for a feature lives together
2. **No horizontal layers**: No global `controllers/`, `models/`, `views/` folders
3. **Page naming**: Svelte pages in `features/[name]/pages/` are PascalCase
4. **Route naming**: Use kebab-case for URLs: `auth/login`, `dashboard/settings`
5. **No atomic components**: NO `Button.svelte`, `Input.svelte`, `Card.svelte`

---

## Creating a New Feature (Step-by-Step)

### Step 1: Create Folder Structure

```bash
mkdir -p src/features/invoices/pages
touch src/features/invoices/{api.ts,service.ts,repository.ts}
touch src/features/invoices/pages/{Index.svelte,Create.svelte,Edit.svelte}
```

### Step 2: Update Database Schema (if needed)

**⚠️ IMPORTANT: Edit `src/features/_core/database/schema.ts` only** - This is the Drizzle ORM schema that auto-generates migrations.

```typescript
// src/features/_core/database/schema.ts
import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(), // UUID v7
  customer: text('customer').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

Then update `src/features/_core/database/connection.ts` to add TypeScript types for Kysely:

```typescript
export interface DatabaseSchema {
  // ... existing tables
  invoices: {
    id: string
    customer: string
    amount: number
    status: 'pending' | 'paid' | 'cancelled'
    created_at: string
    updated_at: string
  }
}
```

### Step 3: Create Migration

Migrations are auto-generated from `schema.ts`. **Never manually edit files in `src/features/_core/database/migrations/`**.

```bash
# Generate migration files from schema.ts (Drizzle will create a new .sql file)
bun run db:generate

# Apply migrations to database
bun run db:migrate
```

### Step 4: Implement Repository

```typescript
// src/features/invoices/repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class InvoiceRepository {
  async findAll() {
    return db.selectFrom('invoices').selectAll().execute()
  }
  
  async findById(id: string) {
    return db.selectFrom('invoices')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }
  
  async create(data: { customer: string; amount: number }) {
    const id = uuidv7()
    const now = new Date().toISOString()
    return db.insertInto('invoices')
      .values({ 
        id, 
        ...data, 
        status: 'pending',
        created_at: now,
        updated_at: now 
      })
      .returningAll()
      .executeTakeFirst()
  }
  
  async update(id: string, data: Partial<{ customer: string; amount: number; status: string }>) {
    return db.updateTable('invoices')
      .set({ ...data, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
  
  async delete(id: string) {
    return db.deleteFrom('invoices').where('id', '=', id).execute()
  }
}
```

### Step 5: Implement Service

```typescript
// src/features/invoices/service.ts
import { t, type Static } from 'elysia'
import { InvoiceRepository } from './repository'

export const CreateInvoiceSchema = t.Object({
  customer: t.String({ minLength: 1, maxLength: 255 }),
  amount: t.Number({ minimum: 0 })
}, { additionalProperties: false })

export const UpdateInvoiceSchema = t.Partial(t.Object({
  customer: t.String({ minLength: 1, maxLength: 255 }),
  amount: t.Number({ minimum: 0 }),
  status: t.Union([
    t.Literal('pending'),
    t.Literal('paid'),
    t.Literal('cancelled')
  ])
}))

export type CreateInvoicePayload = Static<typeof CreateInvoiceSchema>
export type UpdateInvoicePayload = Static<typeof UpdateInvoiceSchema>

export class InvoiceService {
  constructor(private repo: InvoiceRepository = new InvoiceRepository()) {}
  
  async getAll() {
    return this.repo.findAll()
  }
  
  async getById(id: string) {
    return this.repo.findById(id)
  }
  
  async create(payload: CreateInvoicePayload) {
    return this.repo.create(payload)
  }
  
  async update(id: string, payload: UpdateInvoicePayload) {
    return this.repo.update(id, payload)
  }
  
  async delete(id: string) {
    return this.repo.delete(id)
  }
}
```

### Step 6: Implement API Routes

```typescript
// src/features/invoices/api.ts
import { createProtectedApi } from '../_core/auth/protected'
import { InvoiceService, CreateInvoiceSchema, UpdateInvoiceSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const invoiceApi = createProtectedApi('/invoices')
  .derive(() => ({ invoiceService: new InvoiceService() }))
  
  // List all invoices
  .get('/', async (ctx) => {
    const { inertia, invoiceService } = ctx as typeof ctx & { inertia: Inertia }
    const invoices = await invoiceService.getAll()
    return inertia.render('invoices/Index', { invoices })
  })
  
  // Show create form
  .get('/create', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('invoices/Create', { errors: {} })
  })
  
  // Store new invoice
  .post('/', async (ctx) => {
    const { body, invoiceService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      await invoiceService.create(body)
      return inertia.redirect('/invoices')
    } catch (error: any) {
      return inertia.render('invoices/Create', { errors: { message: error.message } })
    }
  }, { body: CreateInvoiceSchema })
  
  // Show edit form
  .get('/:id/edit', async (ctx) => {
    const { params, invoiceService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    const invoice = await invoiceService.getById(params.id)
    if (!invoice) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    return inertia.render('invoices/Edit', { invoice, errors: {} })
  })
  
  // Update invoice
  .put('/:id', async (ctx) => {
    const { params, body, invoiceService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      await invoiceService.update(params.id, body)
      return inertia.redirect('/invoices')
    } catch (error: any) {
      const invoice = await invoiceService.getById(params.id)
      return inertia.render('invoices/Edit', { 
        invoice, 
        errors: { message: error.message } 
      })
    }
  }, { body: UpdateInvoiceSchema })
  
  // Delete invoice
  .delete('/:id', async (ctx) => {
    const { params, invoiceService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    await invoiceService.delete(params.id)
    return inertia.redirect('/invoices')
  })
```

### Step 7: Create Svelte Pages

**Index.svelte:**
```svelte
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Plus, Pencil, Trash } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    invoices: Array<{
      id: string
      customer: string
      amount: number
      status: string
    }>
  }
  
  let { user, invoices }: Props = $props()
  
  const deleteForm = useForm({})
  
  function deleteInvoice(id: string) {
    if (confirm('Delete this invoice?')) {
      $deleteForm.delete(`/invoices/${id}`)
    }
  }
  
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
</script>

<AppLayout title="Invoices" {user}>
<div class="p-6 max-w-5xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
    <a href="/invoices/create" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
      <Plus class="w-4 h-4" />
      New Invoice
    </a>
  </div>
  
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
    <table class="w-full">
      <thead class="bg-slate-50 dark:bg-slate-700">
        <tr>
          <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Customer</th>
          <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Amount</th>
          <th class="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">Status</th>
          <th class="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
        {#each invoices as invoice}
          <tr>
            <td class="px-4 py-3 text-slate-900 dark:text-white">{invoice.customer}</td>
            <td class="px-4 py-3 text-slate-900 dark:text-white">{formatCurrency(invoice.amount)}</td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-1 text-xs rounded-full" class:status-pending={invoice.status === 'pending'} class:status-paid={invoice.status === 'paid'} class:status-cancelled={invoice.status === 'cancelled'}>
                {invoice.status}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <a href="/invoices/{invoice.id}/edit" class="p-1 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                  <Pencil class="w-4 h-4" />
                </a>
                <button onclick={() => deleteInvoice(invoice.id)} class="p-1 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
                  <Trash class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    
    {#if invoices.length === 0}
      <div class="p-8 text-center text-slate-500 dark:text-slate-400">
        No invoices found. Create your first invoice!
      </div>
    {/if}
  </div>
</div>
</AppLayout>

<style>
  .status-pending {
    @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
  }
  .status-paid {
    @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
  }
  .status-cancelled {
    @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
  }
</style>
```

### Step 8: Mount in Bootstrap

Edit `src/bootstrap.ts`:

```typescript
import { invoiceApi } from './features/invoices/api'

app.use(invoiceApi)
```

---

## Development Commands

All commands use Bun (not npm/node):

```bash
# Development - start both backend and frontend
bun run dev

# Backend only (Elysia on port 3000)
bun run dev:server

# Frontend only (Vite dev server on port 5173)
bun run dev:client

# Production build
bun run build

# Start production server
bun run start

# Database
bun run db:migrate      # Run migrations
bun run db:generate     # Generate migration files (Drizzle)
bun run db:seed         # Seed database
bun run db:refresh      # Delete DB + migrate + seed

# Testing
bun run test                # Run unit tests (bun:test)
bun run test:watch          # Watch mode for unit tests
bun run test:e2e            # Run E2E tests (Playwright + Node.js)
npx playwright test --ui    # Interactive E2E mode
npx playwright test --headed # See browser for E2E

# Type checking
bun run typecheck       # tsc + svelte-check
```

### Default Credentials

After seeding: `admin@example.com` / `password123`

---

## Code Style Guidelines

### TypeScript

- Use strict TypeScript (`strict: true`)
- Path aliases: `$features/*`, `$shared/*`, `$inertia/*`
- Bun-native APIs preferred: `Bun.password.hash()`, `Bun.file()`, `Bun.write()`
- Always export types from feature index files

### Svelte 5

- Use runes: `$props()`, `$state()`, `$derived()`, `$effect()`
- Inline Tailwind classes - no component abstractions for simple UI
- Use `lucide-svelte` for icons
- Props interface naming: `Props`
- **WAJIB pakai AppLayout untuk protected pages**

```svelte
<script lang="ts">
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; name: string; email: string }
    items: string[]
  }
  
  let { user, items }: Props = $props()
  let count = $state(0)
</script>

<AppLayout title="Items" {user}>
  <div class="p-6 max-w-5xl mx-auto">
    <!-- Page content -->
  </div>
</AppLayout>
```

**Exception:** Auth pages (login, register) TIDAK pakai AppLayout.

### Component Strategy

**DON'T** create atomic components (Button, Input, Card).
**DO** write Tailwind utilities directly in pages.
**ONLY** create components for complex reusable UI (Modal, DataTable, etc).

**Location:** `src/shared/components/[ComponentName].svelte`

Example:
```svelte
<!-- Good: Inline Tailwind -->
<button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  <Save class="w-4 h-4" />
  Save
</button>
```

### Shared Utilities

**Location:** `src/shared/lib/`

| File | Import | Usage |
|------|--------|-------|
| `debounce.ts` | `import { debounce } from '$shared/lib/debounce'` | `debounce(fn, 300)` |
| `csv.ts` | `import { downloadCSV } from '$shared/lib/csv'` | `downloadCSV('file', data)` |
| `toast.ts` | `import { toast } from '$shared/lib/toast'` | `toast.success('Saved!')` |
| `image.ts` | `import { processImage } from '$shared/lib/image'` | Image resize, convert, compress |

#### Toast Usage
```typescript
import { toast } from '$shared/lib/toast'

// Simple one-liner (just like vanilla JS!)
toast.success('Item saved successfully')
toast.error('Failed to save item')
toast.warning('Please check your input')
toast.info('New update available')

// With custom duration (ms)
toast.success('Saved!', 5000) // 5 seconds
```

**Note:** ToastContainer sudah otomatis di-render di AppLayout, jadi tinggal panggil `toast.xxx()` saja.

### Storage Infrastructure

**Location:** `src/features/_core/storage/`

Abstraction layer for file storage. Supports Local filesystem and S3-compatible storage.

**Required packages:**
```bash
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp
```

| File | Purpose |
|------|---------|
| `index.ts` | Storage interface & factory function |
| `local.ts` | Local filesystem storage provider |
| `s3.ts` | S3/Wasabi/MinIO storage provider + presigned URLs |

#### Usage

```typescript
import { createStorage } from '$features/_core/storage'

const storage = createStorage()

// Upload file
await storage.upload('path/to/file.png', fileBuffer, 'image/png')

// Get public URL
const url = storage.getPublicUrl('path/to/file.png')

// Delete file
await storage.delete('path/to/file.png')

// S3 only: Presigned URL for direct client upload
const presignedUrl = await storage.getPresignedUploadUrl?(
  'path/to/file.png', 
  'image/png', 
  3600  // expires in 1 hour
)
```

#### Environment Variables

```bash
# Storage Driver: 'local' or 's3'
STORAGE_DRIVER=local

# Local Storage
LOCAL_STORAGE_PATH=./storage
LOCAL_STORAGE_URL=/storage

# S3 Storage (if STORAGE_DRIVER=s3)
S3_BUCKET=my-bucket
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.wasabisys.com
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
CDN_URL=https://cdn.example.com  # Optional
```

### Input Styling Standard

Use **simple border color change** on focus - NO ring/glow effects.

```svelte
<!-- Standard text input -->
<input 
  type="text"
  class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 
    bg-white dark:bg-slate-700 text-gray-900 dark:text-white 
    focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 
    transition-colors"
/>

<!-- Input with icon (padding adjusted) -->
<input 
  type="email"
  class="block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm 
    bg-white dark:bg-slate-900 text-slate-900 dark:text-white 
    placeholder-slate-400 dark:placeholder-slate-500
    border-slate-200 dark:border-slate-600 
    focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 
    transition-colors"
/>

<!-- Error state -->
<input 
  type="email"
  class="... border-red-300 dark:border-red-700 
    focus:border-red-500 dark:focus:border-red-400 ..."
/>

<!-- Disabled state -->
<input 
  disabled
  class="... border-gray-200 dark:border-slate-700 
    bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 ..."
/>
```

**Key rules:**
- `focus:outline-none` - Remove default browser outline
- `focus:border-{color}` / `dark:focus:border-{color}` - Only change border color on focus
- NO `focus:ring-2`, NO `focus:ring-{color}` - Avoid glow effects
- NO `focus:border-transparent` - Keep border visible
- Always include `transition-colors` for smooth transition
- Dark mode colors: `-400` for focus (brighter), `-500` for borders

### Notifications (Real-time)

WebSocket-based notification system with real-time updates.

**Features:**
- Real-time push notifications via WebSocket
- Persistent storage in database
- Unread count badge
- Mark as read / delete
- 4 notification types: `info`, `success`, `warning`, `error`

**Send notification from any feature:**

```typescript
import { sendNotification } from '../notifications/api'

// In your API route
await sendNotification({
  userId: 'user-uuid',
  type: 'success', // 'info' | 'success' | 'warning' | 'error'
  title: 'Invoice Paid',
  message: 'Customer John paid $500 for Invoice #123'
})
```

**WebSocket Events (client-side):**

```typescript
// AppLayout automatically handles these events:
// - 'connected' - Initial unread count
// - 'notification' - New notification arrived
// - 'markedAsRead' - Single notification marked as read
// - 'markedAllAsRead' - All notifications marked as read
```

**Database schema:**
- `notifications` table: id, user_id, type, title, message, read_at, created_at
- Auto-cleanup: Notifications older than 90 days are purged

### Dark Mode

Enabled via `@variant dark` in `app.css`. Toggle by adding/removing `.dark` class on `<html>`.

```svelte
<script>
  let darkMode = $state(false)
  
  function toggleDark() {
    darkMode = !darkMode
    document.documentElement.classList.toggle('dark', darkMode)
  }
</script>

<button onclick={toggleDark}>
  {darkMode ? '🌙' : '☀️'}
</button>

<!-- Usage with Tailwind -->
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  <h1 class="text-slate-800 dark:text-slate-100">Title</h1>
  <p class="text-slate-600 dark:text-slate-400">Description</p>
</div>
```

Common patterns:
- Background: `bg-white dark:bg-slate-900`
- Text: `text-slate-900 dark:text-slate-100`
- Muted text: `text-slate-500 dark:text-slate-400`
- Borders: `border-slate-200 dark:border-slate-700`
- Cards: `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700`

### Database

- UUID v7 for all primary keys (use `uuidv7()` from `$shared/lib/uuid`)
- ISO string for timestamps: `new Date().toISOString()`
- Repository pattern: one class per feature
- Kysely for runtime queries, Drizzle only for migrations

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | camelCase or PascalCase | `api.ts`, `Login.svelte` |
| Classes | PascalCase | `InvoiceService` |
| Functions | camelCase | `findById()` |
| Database columns | snake_case | `created_at` |
| URL routes | kebab-case | `/invoices/create` |
| Features | camelCase | `invoices`, `userSettings` |

---

## Authentication & Authorization

### Current Auth System

- JWT stored in HTTP-only cookie
- 7-day expiration (30 days with "remember me")
- User attached to context via middleware

### Protecting Routes (DRY Pattern)

**Use `createProtectedApi()` helper** - Don't repeat auth boilerplate:

```typescript
import { createProtectedApi } from '../_core/auth/protected'

export const myApi = createProtectedApi('/my-feature')
  .get('/', (ctx) => {
    const user = (ctx as any).user  // Already attached by middleware
    return ctx.inertia.render('my-feature/Index', { user })
  })
```

### Accessing Current User

```typescript
// In route handler
.get('/', (ctx) => {
  const user = (ctx as any).user  // { id, email, name, role }
})
```

### Role-Based Access Control

```typescript
// Check role in route
.get('/admin', (ctx) => {
  const user = (ctx as any).user
  if (user.role !== 'admin') {
    return ctx.inertia.render('errors/403', { message: 'Access denied' })
  }
  return ctx.inertia.render('admin/Index')
})

// Or use middleware pattern
.onBeforeHandle((ctx) => {
  const user = (ctx as any).user
  if (user.role !== 'admin') {
    return ctx.inertia.redirect('/dashboard')
  }
})
```

### Manual Pattern (If Needed)

```typescript
// Only use this if you need custom auth logic
import { Elysia } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { inertia } from '../../inertia/plugin'
import { env } from '../../../config/env'

export const customApi = new Elysia({ prefix: '/custom' })
  .use(cookie())
  .use(jwt({ secret: env.JWT_SECRET, exp: '7d' }))
  .use(inertia())
  .onBeforeHandle(async (ctx) => {
    // Custom auth logic here
  })
```

### Common Mistake (DON'T DO THIS)

```typescript
// ❌ WRONG - This will throw error:
// TypeError: .auth is not a function
export const wrongApi = new Elysia({ prefix: '/wrong' })
  .use(authApi)
  .auth(true)  // ❌ Error! auth() macro doesn't exist here
```

---

## Inertia.js Patterns

### Rendering Pages

```typescript
// Backend
return inertia.render('feature/Page', { 
  user: { id: '...', name: 'John' },
  items: [...]
})
```

### Handling Forms

```svelte
<!-- Frontend -->
<script>
  import { useForm } from '@inertiajs/svelte'
  
  const form = useForm({
    email: '',
    password: ''
  })
  
  function submit(e) {
    e.preventDefault()
    $form.post('/auth/login')
  }
</script>

<form onsubmit={submit}>
  <input bind:value={$form.email} />
  <button type="submit" disabled={$form.processing}>Submit</button>
</form>
```

### Redirects

```typescript
// Success redirect
return inertia.redirect('/dashboard')

// Back with errors
return inertia.render('auth/Login', {
  errors: { email: 'Invalid credentials' }
})
```

### Page Resolution

Pages are auto-discovered from `src/features/**/pages/*.svelte`:

```
inertia.render('dashboard/Index')  → features/dashboard/pages/Index.svelte
inertia.render('auth/Login')       → features/auth/pages/Login.svelte
```

---

## Production-Ready Features

### Environment Variable Validation

All environment variables are validated at startup using Zod. Invalid or missing variables will cause the application to exit immediately with a clear error message.

**Location:** `src/config/env.ts`

```typescript
import { env, isS3Configured, backupConfig } from '$config/env'

// Use validated env vars
const port = env.PORT
const jwtSecret = env.JWT_SECRET // Guaranteed to be at least 32 chars
```

**Required in production:**
- `JWT_SECRET` - Must be at least 32 characters
- `NODE_ENV=production`
- `DATABASE_URL` - SQLite database path

### Rate Limiting

Protects against brute force attacks and abuse.

**Location:** `src/features/_core/middleware/rateLimit.ts`

```typescript
import { createRateLimit, rateLimits } from '$features/_core/middleware/rateLimit'

// Use predefined limits
export const api = createProtectedApi('/api')
  .use(rateLimits.strict)    // 5 req/min - for auth endpoints
  .use(rateLimits.standard)  // 100 req/min - for API
  .use(rateLimits.generous)  // 1000 req/min - for public

// Or custom limit
.use(createRateLimit({ maxRequests: 10, windowMs: 60000 }))
```

**Rate limit headers:**
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests in window
- `X-RateLimit-Reset` - Unix timestamp when window resets

### Centralized Error Handling

Consistent error responses with proper logging.

**Location:** `src/features/_core/middleware/errorHandler.ts`

```typescript
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  AuthenticationError,
  AuthorizationError 
} from '$features/_core/middleware/errorHandler'

// Throw specific errors in services
throw new NotFoundError('User')
throw new ValidationError('Email is required')
throw new AuthenticationError()

// Error response format:
{
  success: false,
  error: {
    code: 'NOT_FOUND',
    message: 'User not found'
  },
  timestamp: '2024-01-01T00:00:00.000Z',
  requestId: 'abc-123-xyz'
}
```

### Comprehensive Health Checks

Monitor application health for load balancers and monitoring tools.

**Endpoints:**
- `GET /health` - Full health check with all services
- `GET /health/live` - Liveness probe (fast)
- `GET /health/ready` - Readiness probe (checks DB/storage)

**Health response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 3600,
  "checks": {
    "database": { "status": "pass", "responseTimeMs": 5 },
    "storage": { "status": "pass", "responseTimeMs": 10 },
    "memory": { "status": "pass", "details": { "heapUsedMB": 45 } }
  }
}
```

### Graceful Shutdown

Clean shutdown on SIGTERM/SIGINT:
1. Stop accepting new requests
2. Wait for active requests to complete (with timeout)
3. Stop background services (backup, etc.)
4. Close database connections
5. Exit process

**Location:** `src/features/_core/middleware/gracefulShutdown.ts`

### Request Logging

Structured request logging with response times and metadata.

**Location:** `src/features/_core/middleware/requestLogger.ts`

**Log format (development):**
```
14:32:01 GET    200   23ms    1.2KB  /api/users                chrome
14:32:02 POST   201   45ms    0.5KB  /api/users                chrome user:abc123
14:32:03 GET    500  120ms      -    /api/error                [Database timeout]
```

**Log format (production - JSON):**
```json
{"timestamp":"2024-01-01T00:00:00.000Z","level":"info","method":"GET","path":"/api/users","statusCode":200,"responseTimeMs":23,"ip":"1.2.3.4","requestId":"abc-123"}
```

### Security Headers

Automatic security headers via `elysia-helmet`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- And more...


 