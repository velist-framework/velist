# EISK Stack - Agent Guide

**E**lysia + **I**nertia.js + **S**velte + **K**ysely

A full-stack TypeScript framework with vertical feature slicing architecture, running on Bun runtime.

---

## Project Overview

This is a full-stack web application boilerplate using the EISK stack:

- **Backend**: Elysia (Bun web framework) with TypeBox validation
- **Frontend**: Svelte 5 with runes, Inertia.js for SPA experience
- **Database**: SQLite via Kysely (runtime) + Drizzle (migrations)
- **Styling**: Tailwind CSS v4
- **Runtime**: Bun (required)

### Key Characteristics

- **Vertical Feature Slicing**: Each feature contains its own API, service, repository, and pages
- **End-to-End Type Safety**: Database → TypeBox → Svelte props
- **No API Layer**: Inertia.js handles backend-frontend communication transparently
- **Native UUID v7**: Custom implementation, no external dependencies
- **Custom Inertia Plugin**: Built specifically for Elysia (no official plugin exists)

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
│   ├── layouts/            # Inertia layouts
│   │   ├── AppLayout.svelte
│   │   └── PublicLayout.svelte
│   ├── lib/                # Utilities
│   │   └── uuid.ts         # UUID v7 generator
│   └── styles/
│       └── app.css         # Tailwind entry
└── types/
    └── elysia.d.ts         # Type declarations

db/                        # SQLite databases (gitignored)
tests/
├── e2e/                   # Playwright E2E tests
│   ├── auth.spec.ts
│   └── setup.ts
└── README.md

static/                    # Static assets
```

### Key Rules

1. **One folder = One feature**: All code for a feature lives together
2. **No horizontal layers**: No global `controllers/`, `models/`, `views/` folders
3. **Page naming**: Svelte pages in `features/[name]/pages/` are PascalCase
4. **Route naming**: Use kebab-case for URLs: `auth/login`, `dashboard/settings`

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

## Creating a New Feature

### 1. Create folder structure

```bash
mkdir -p src/features/invoices/pages
touch src/features/invoices/{api.ts,service.ts,repository.ts}
touch src/features/invoices/pages/Index.svelte
touch src/features/invoices/pages/Create.svelte
```

### 2. Update database schema (if needed)

Edit `src/features/_core/database/connection.ts` - add to `DatabaseSchema` interface.

### 3. Create migration

```bash
bun run db:generate
bun run db:migrate
```

### 4. Implement repository

```typescript
// src/features/invoices/repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class InvoiceRepository {
  async findAll() {
    return db.selectFrom('invoices').selectAll().execute()
  }
  
  async create(data: any) {
    const id = uuidv7()
    await db.insertInto('invoices').values({ id, ...data }).execute()
    return this.findById(id)
  }
}
```

### 5. Implement service

```typescript
// src/features/invoices/service.ts
import { InvoiceRepository } from './repository'
import { t, type Static } from 'elysia'

export const CreateInvoiceSchema = t.Object({
  customer: t.String(),
  amount: t.Number()
})

export type CreateInvoicePayload = Static<typeof CreateInvoiceSchema>

export class InvoiceService {
  constructor(private repo: InvoiceRepository = new InvoiceRepository()) {}
  
  async create(payload: CreateInvoicePayload) {
    return this.repo.create(payload)
  }
}
```

### 6. Implement API routes

```typescript
// src/features/invoices/api.ts
import { Elysia } from 'elysia'
import { InvoiceService, CreateInvoiceSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const invoiceApi = new Elysia({ prefix: '/invoices' })
  .use(inertia())
  .derive(() => ({ invoiceService: new InvoiceService() }))
  
  .get('/', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('invoices/Index', { 
      invoices: [] 
    })
  })
  
  .post('/', async (ctx) => {
    const { body, invoiceService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    await invoiceService.create(body)
    return inertia.redirect('/invoices')
  }, {
    body: CreateInvoiceSchema
  })
```

### 7. Create Svelte page

```svelte
<!-- src/features/invoices/pages/Index.svelte -->
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  
  interface Props {
    invoices: Array<{ id: string; customer: string; amount: number }>
  }
  
  let { invoices }: Props = $props()
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold">Invoices</h1>
  <!-- UI here -->
</div>
```

### 8. Mount in bootstrap

Edit `src/bootstrap.ts`:

```typescript
import { invoiceApi } from './features/invoices/api'

app.use(invoiceApi)
```

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
