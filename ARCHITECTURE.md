# EISK Stack Architecture

**Stack**: Elysia (Bun) + Inertia.js 2 + Svelte 5 + Kysely/Drizzle + Bun:SQLite  
**Pattern**: Vertical Feature Slicing  
**ID System**: UUID v7 (native implementation, no deps)

---

## Project Structure

```
src/
├── features/              # Vertical slices
│   ├── _core/            # Core infrastructure
│   │   ├── auth/         # api.ts, service.ts, repository.ts, pages/*.svelte
│   │   └── database/     # connection.ts, migrations/, schema.ts
│   └── [feature]/        # Repeat pattern: api + service + repo + pages
├── shared/
│   ├── lib/              # uuid.ts (UUID v7 native)
│   └── styles/           # app.css (Tailwind v4)
├── inertia/
│   ├── plugin.ts         # Custom Inertia adapter (dev/prod asset handling)
│   └── app.ts            # Client bootstrap
└── bootstrap.ts          # App root
```

**Key Rule**: 1 feature = API + Service + Repository + Pages dalam 1 folder.

---

## Database Architecture

**Runtime**: Kysely + `kysely-bun-sqlite` driver  
**Migrations**: Drizzle ORM (reliable with bun:sqlite)  
**Schema**: Drizzle schema → generate SQL → Kysely runtime

```typescript
// Repository pattern with UUID v7
async create(data: InsertableUser) {
  const user = {
    id: uuidv7(),  // Generate before insert
    ...data,
    created_at: new Date().toISOString()
  }
  return db.insertInto('users').values(user).returningAll().executeTakeFirst()
}
```

---

## Custom Inertia Plugin

`@elysiajs/inertia` tidak tersedia → custom implementation di `src/inertia/plugin.ts`.

**Features**:
- Environment-aware asset loading (dev: Vite server, prod: hashed assets)
- Manifest.json parsing for production builds
- CSP-friendly inline JSON for page data

```typescript
// vite.config.ts - Dual entry for CSS/JS separation
build: {
  rollupOptions: {
    input: {
      app: './src/inertia/app.ts',
      styles: './src/styles/app.css'
    }
  }
}
```

---

## Component Strategy

**No Atomic Components**: Tidak ada `Button.svelte`, `Input.svelte`, dll.  
**Just Inline**: Tailwind utility classes langsung di pages.  
**Only When Needed**: Komponen hanya untuk reusable complex UI (Modal, etc).

**Icons**: `lucide-svelte` - tree-shakeable, stroke-based.

```svelte
<script>
  import { Eye, EyeOff } from 'lucide-svelte'
</script>

<button class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">
  <Eye class="w-4 h-4" />
  <span>Show</span>
</button>
```

---

## Development Workflow

```bash
# Dev (concurrently server + Vite)
bun run dev

# Production
bun run build && bun run start

# Database
bun run db:generate   # Drizzle generate
bun run db:migrate    # Run migrations
bun run refresh       # Delete SQLite + migrate + seed

# Testing
bun run test:e2e      # Playwright
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| UUID v7 (native) | Time-ordered, unguessable, no external deps |
| Kysely-bun-sqlite | Default Kysely SQLite driver has "disk I/O error" with Bun |
| Drizzle only for migrations | Drizzle runtime tidak se-stabil Kysely dengan Bun |
| Custom Inertia plugin | `@elysiajs/inertia` doesn't exist |
| No component abstraction | Single dev, faster iteration, Tailwind is enough |
| Dual entry Vite build | CSS and JS loaded separately, cleaner architecture |

---

## Current Implementation Status

✅ Auth system (login, register, logout, JWT cookie)  
✅ UUID v7 native implementation  
✅ Database migrations with Drizzle  
✅ Custom Inertia plugin with asset hashing  
✅ Modern UI with password generator, strength indicator  
✅ E2E tests with Playwright  

---

## Laravel Migration Notes

| Laravel | EISK Equivalent |
|---------|-----------------|
| `php artisan migrate` | `bun run db:migrate` |
| `php artisan db:seed` | `bun run db:seed` |
| `auth()->user()` | `ctx.user` (from JWT middleware) |
| `return inertia('Dashboard')` | `inertia.render('dashboard/Index')` |
| `route('login')` | Hardcoded paths (no named routes yet) |
| Blade components | Svelte pages dengan Tailwind inline |
