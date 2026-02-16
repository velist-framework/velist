# EISK Stack - Boilerplate

**E**lysia + **I**nertia.js + **S**velte + **K**ysely

Full-stack TypeScript framework dengan vertical feature slicing architecture.

## Features

- ⚡ **Elysia** - Fast Bun web framework dengan type safety
- 🔄 **Inertia.js** - SPA experience tanpa API complexity
- ⚡ **Svelte 5** - Reactive frontend dengan runes
- 📊 **Kysely** - Type-safe SQL query builder
- 🔐 **Authentication** - JWT + Cookie based auth built-in
- 📁 **Vertical Slicing** - Feature-based folder structure
- 🎯 **Type Safety** - End-to-end type safety dari database ke UI

## Project Structure

```
src/
├── features/              # VERTICAL SLICES
│   ├── _core/            # Core infrastructure
│   │   ├── auth/         # Authentication feature
│   │   │   ├── api.ts           # Elysia routes
│   │   │   ├── service.ts       # Business logic
│   │   │   ├── repository.ts    # Database access
│   │   │   └── pages/
│   │   │       ├── Login.svelte
│   │   │       └── Register.svelte
│   │   └── database/
│   │       ├── connection.ts    # Kysely instance
│   │       └── migrations/
│   └── dashboard/        # Example feature
│       ├── api.ts
│       └── pages/
│           └── Index.svelte
├── shared/               # Cross-cutting concerns
│   ├── layouts/          # Inertia layouts
│   └── ui/               # UI primitives
└── inertia/              # Inertia bootstrap
    └── app.ts
```

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

### 3. Run Database Migrations

```bash
bun run db:migrate
```

### 4. Seed Database (Optional)

```bash
bun run db:seed
```

Default admin: `admin@example.com` / `password123`

### 5. Start Development Server

```bash
bun run dev
```

Server akan berjalan di:
- Backend: http://localhost:3000
- Frontend (Vite): http://localhost:5173

## Development Workflow

### Create New Feature

```bash
mkdir src/features/invoices
touch src/features/invoices/{api.ts,service.ts,repository.ts}
mkdir -p src/features/invoices/pages
touch src/features/invoices/pages/Index.svelte
```

### Define Database Schema

1. Update `DatabaseSchema` interface di `src/features/_core/database/connection.ts`
2. Buat migration file di `src/features/_core/database/migrations/`
3. Run `bun run db:migrate`

### Build API + UI

1. Implement repository methods
2. Write business logic di service
3. Create Elysia routes di `api.ts`
4. Create Svelte page di `pages/`

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (backend + frontend) |
| `bun run dev:server` | Backend only |
| `bun run dev:client` | Frontend only |
| `bun run build` | Build for production |
| `bun run db:migrate` | Run database migrations |
| `bun run db:seed` | Seed database |
| `bun run typecheck` | TypeScript + Svelte check |

## Architecture Principles

1. **Vertical Slicing**: 1 folder = 1 feature lengkap (API + UI + DB)
2. **Type Safety Chain**: Database → TypeBox → Svelte Props
3. **Co-location**: Backend & frontend logic dalam 1 folder
4. **No Horizontal Layers**: Tidak ada `controllers/`, `models/` global
5. **Bun-Native**: Gunakan built-in Bun APIs

## Deployment

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET`
3. Run `bun run build`
4. Start dengan `bun src/bootstrap.ts`

## License

MIT
