# EISK Stack

**E**lysia + **I**nertia.js + **S**velte + **K**ysely

Full-stack TypeScript framework dengan vertical feature slicing architecture, running on Bun runtime.

## Features

- ⚡ **Elysia** - Fast Bun web framework dengan type-safe validation
- 🔄 **Inertia.js** - SPA experience tanpa API complexity (custom plugin)
- ⚡ **Svelte 5** - Reactive frontend dengan runes
- 🎨 **Tailwind CSS v4** - Utility-first styling dengan dark mode
- 📊 **Kysely + Drizzle** - Type-safe SQL (runtime + migrations)
- 🔐 **Auth Built-in** - JWT + Cookie based auth dengan password generator
- 🌙 **Dark Mode** - Toggle dengan localStorage persistence
- 🧪 **E2E Testing** - Playwright tests included

## Quick Start

```bash
# 1. Install
bun install

# 2. Setup environment
cp .env.example .env

# 3. Database setup
bun run db:migrate
bun run db:seed  # Optional: creates admin@example.com / password123

# 4. Start development
bun run dev
```

Server berjalan di:
- Backend: http://localhost:3000
- Frontend (Vite): http://localhost:5173

## Project Structure

```
src/
├── features/              # VERTICAL SLICES
│   ├── _core/            # Core infrastructure
│   │   ├── auth/         # api.ts, service.ts, repository.ts, pages/*.svelte
│   │   └── database/     # connection.ts, migrations/
│   └── [feature]/        # Repeat pattern
├── shared/
│   ├── lib/              # uuid.ts (UUID v7 native)
│   └── styles/           # app.css (Tailwind + dark mode)
├── inertia/
│   ├── plugin.ts         # Custom Inertia adapter
│   └── app.ts            # Client bootstrap
└── bootstrap.ts          # App entry
```

**Key Rule**: 1 feature = API + Service + Repository + Pages dalam 1 folder.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (backend + frontend) |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:migrate` | Run migrations |
| `bun run db:seed` | Seed database |
| `bun run refresh` | Reset DB + migrate + seed |
| `bun run test:e2e` | Run Playwright tests |
| `bun run typecheck` | TypeScript + Svelte check |

## Key Features

### Custom Inertia Plugin

`@elysiajs/inertia` tidak tersedia → custom implementation dengan:
- Dev: Vite HMR client
- Prod: Hashed assets via manifest.json

### Dark Mode

```svelte
<!-- Toggle button -->
<button onclick={toggleDarkMode}>
  {darkMode ? '☀️' : '🌙'}
</button>

<!-- Styled elements -->
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
```

### Password Features

- **Generator**: 16-char secure password
- **Strength Indicator**: 5-level visual feedback
- **Show/Hide Toggle**: Eye icon button

### UUID v7 (Native)

```typescript
import { uuidv7 } from './shared/lib/uuid'

const id = uuidv7()  // Time-ordered, no external deps
```

## Creating a Feature

```bash
mkdir -p src/features/invoices/pages
touch src/features/invoices/{api.ts,service.ts,repository.ts}
touch src/features/invoices/pages/Index.svelte
```

See [AGENTS.md](./AGENTS.md) for detailed guide.

## Deployment

```bash
# 1. Production build
bun run build

# 2. Set environment
NODE_ENV=production
JWT_SECRET=your-secure-secret

# 3. Run migrations
bun run db:migrate

# 4. Start
bun run start
```

## License

MIT
