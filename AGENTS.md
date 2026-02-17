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
| Form validation | TypeBox schema in service.ts |
| Authentication | Use `authApi` and `.auth(true)` macro |

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
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Icons | lucide-svelte | Tree-shakeable icon library |
| Testing | Playwright | E2E testing (requires Node.js) |

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
│   │   └── database/
│   │       ├── connection.ts    # Kysely instance
│   │       ├── schema.ts        # Drizzle schema
│   │       ├── seeder.ts        # Database seeder
│   │       └── migrations/
│   │           ├── runner.ts
│   │           └── *.sql
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

Edit `src/features/_core/database/connection.ts`:

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

```bash
bun run db:generate
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
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { InvoiceService, CreateInvoiceSchema, UpdateInvoiceSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const invoiceApi = new Elysia({ prefix: '/invoices' })
  .use(authApi)
  .auth(true)  // Require authentication
  .use(inertia())
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
  
  interface Props {
    invoices: Array<{
      id: string
      customer: string
      amount: number
      status: string
    }>
  }
  
  let { invoices }: Props = $props()
  
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

# Testing (requires Node.js for Playwright)
npx playwright test           # Run E2E tests
npx playwright test --ui      # Interactive mode
npx playwright test --headed  # See browser

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

```svelte
<script lang="ts">
  interface Props {
    user: { id: string; name: string }
    items: string[]
  }
  
  let { user, items }: Props = $props()
  let count = $state(0)
</script>
```

### Component Strategy

**DON'T** create atomic components (Button, Input, Card).
**DO** write Tailwind utilities directly in pages.
**ONLY** create components for complex reusable UI (Modal, DataTable, etc).

Example:
```svelte
<!-- Good: Inline Tailwind -->
<button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  <Save class="w-4 h-4" />
  Save
</button>
```

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
- `auth()` macro for protected routes

### Protecting Routes

```typescript
// Inherit from authApi to get user context
import { authApi } from '../_core/auth/api'

export const protectedApi = new Elysia({ prefix: '/admin' })
  .use(authApi)  // Brings JWT, cookie, user context
  .auth(true)    // Macro to require authentication
```

### Accessing Current User

```typescript
// In route handler
.get('/', (ctx) => {
  const user = (ctx as any).user  // { id, email, name }
})
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

## Testing Strategy

### E2E Tests (Playwright)

**Important**: Playwright requires Node.js, not Bun.

```bash
# Run with Node.js
npx playwright test
```

Test database: `db/test.sqlite` (auto-created, auto-cleaned)

### Test Structure

```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/route')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*dashboard.*/)
})
```

### Running Tests

Tests automatically:
1. Start dev server (`bun run dev:server`)
2. Use separate test database
3. Clean up after completion

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=change-this-in-production
FRONTEND_URL=http://localhost:5173
```

---

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to secure random string
3. Build assets: `bun run build`
4. Run migrations: `bun run db:migrate`
5. Start: `bun src/bootstrap.ts`

### Docker Notes

- Use official Bun image
- SQLite database should be on persistent volume
- Build assets during image build
- Port 3000 exposed

---

## Common Issues & Solutions

### "disk I/O error" with SQLite
Solution: Using `kysely-bun-sqlite` instead of default Kysely SQLite driver.

### Type errors in Svelte files
Run: `bun run typecheck`

### Inertia page not found
Check:
1. Page exists in `features/[feature]/pages/[Name].svelte`
2. Component name matches render call: `inertia.render('feature/Name')`
3. Case sensitivity (PascalCase for pages)

### Migration fails
- Ensure `db/` directory exists
- Check foreign key constraints order in SQL

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| UUID v7 (native) | Time-ordered, unguessable, zero dependencies |
| Kysely + bun-sqlite | Default Kysely SQLite driver has issues with Bun |
| Drizzle for migrations only | Drizzle runtime less stable than Kysely with Bun |
| Custom Inertia plugin | No official `@elysiajs/inertia` exists |
| No component abstraction | Faster iteration, Tailwind is expressive enough |
| Dual entry Vite build | CSS and JS loaded separately, cleaner architecture |
| Dark mode | Tailwind `@variant dark` with CSS variables (toggle via `.dark` class) |

---

## References

- [Elysia Docs](https://elysiajs.com/)
- [Inertia.js Docs](https://inertiajs.com/)
- [Svelte 5 Docs](https://svelte.dev/docs/svelte/what-are-runes)
- [Kysely Docs](https://kysely.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS v4](https://tailwindcss.com/)
