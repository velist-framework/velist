# Velist

<p align="center">
  <strong>Velocity</strong> + <strong>List</strong> — Features-first fullstack framework
</p>

<p align="center">
  Elysia + Inertia.js + Svelte + Kysely
</p>

<p align="center">
  Full-stack TypeScript framework dengan vertical feature slicing architecture, running on Bun runtime.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#examples">Examples</a>
</p>

<p align="center">
  <a href="https://github.com/your-username/eisk-stack/stargazers">
    <img src="https://img.shields.io/github/stars/your-username/eisk-stack?style=social" alt="Stars">
  </a>
  <a href="https://github.com/your-username/eisk-stack/issues">
    <img src="https://img.shields.io/github/issues/your-username/eisk-stack" alt="Issues">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/your-username/eisk-stack" alt="License">
  </a>
</p>

---

## ⚡ Quick Start

### Using `bun create` (Recommended)

```bash
bun create velist my-app
cd my-app

# Setup environment
cp .env.example .env

# Optional: Setup Google OAuth (untuk login dengan Google)
# Lihat panduan: ./docs/GOOGLE_AUTH.md

# Setup database
bun run db:migrate
bun run db:seed

# Start development
bun run dev
```

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/velist-framework/velist.git my-app
cd my-app

# Install dependencies
bun install

# Setup environment
cp .env.example .env

# Optional: Setup Google OAuth (untuk login dengan Google)
# Lihat panduan: ./docs/GOOGLE_AUTH.md

# Setup database
bun run db:migrate
bun run db:seed

# Start development
bun run dev
```

Server berjalan di:
- 🌐 **App**: http://localhost:3000
- ⚡ **Vite Dev**: http://localhost:5173

Default credentials: `admin@example.com` / `password123`

--- 

## ✨ Features

- ⚡ **Elysia** - Fast Bun web framework dengan type-safe validation
- 🔄 **Inertia.js** - SPA experience tanpa API complexity (custom plugin)
- ⚡ **Svelte 5** - Reactive frontend dengan runes
- 🎨 **Tailwind CSS v4** - Utility-first styling dengan dark mode
- 📊 **Kysely + Drizzle** - Type-safe SQL (runtime + migrations)
- 🔐 **Auth Built-in** - JWT + Cookie based auth dengan password generator & Google OAuth
- 🌙 **Dark Mode** - Toggle dengan localStorage persistence
- 🧪 **E2E Testing** - Playwright tests included
- 🤖 **AI-Ready** - Cursor rules & Claude Code integration

---

## 📊 Performance Benchmarks

Tested on Mac Mini M4 (10-core, 16GB RAM) with `wrk -t12 -c400 -d30s`:

| Metric | Velist | Express |
|--------|--------|---------|
| Hello World (Text) RPS | **85,703** | ~21,000 |
| Hello World (JSON) RPS | **84,511** | ~21,000 |
| Inertia HTML RPS | **66,694** | N/A |
| Memory Usage (idle) | 28MB | 45MB |
| Cold Start | ~40ms | ~60ms |

*Velist 4× faster than Express for simple responses, 3× faster for full HTML rendering.*

---

## 📁 Project Structure

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

---

## 🛠️ Scripts

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

---

## 📝 Laravel → Velist Cheat Sheet

| Laravel | Velist Equivalent |
|---------|-----------------|
| `php artisan migrate` | `bun run db:migrate` |
| `php artisan db:seed` | `bun run db:seed` |
| `php artisan make:model` | Create repository.ts |
| `php artisan make:controller` | Create api.ts |
| `auth()->user()` | `ctx.user` (from JWT middleware) |
| `return inertia('Dashboard')` | `inertia.render('dashboard/Index')` |
| `Route::get('/users', ...)` | `.get('/users', ...)` in api.ts |
| `User::all()` | `db.selectFrom('users').selectAll().execute()` |
| `User::find($id)` | `db.selectFrom('users').where('id', '=', id).executeTakeFirst()` |
| `User::create($data)` | `db.insertInto('users').values(data).execute()` |
| `validate($request, [...])` | TypeBox schema in route definition |
| `Session::flash('success')` | Return flash object in page props |

---

## 🤖 AI Development

Velist includes comprehensive AI context for better code generation:

### Cursor IDE
The `.cursorrules` file provides coding patterns and conventions.

### Claude Code
The `.claude.md` file contains detailed patterns for feature generation.

### Quick AI Prompts

```markdown
"Create a new 'projects' feature with:
- Title, description, status fields
- CRUD operations
- Only authenticated users can access"
```

AI akan otomatis generate:
1. Database migration
2. Repository dengan Kysely
3. Service dengan TypeBox validation
4. API routes
5. Svelte pages (Index, Create, Edit)

---

## 📚 Documentation

- [Installation Guide](./docs/guides/installation.md)
- [Creating Features](./docs/guides/creating-features.md)
- [Authentication](./docs/guides/authentication.md)
- [Google OAuth Setup](./docs/GOOGLE_AUTH.md) - Setup Google Sign-In
- [Testing](./docs/guides/testing.md)
- [Deployment](./docs/deployment/docker.md)
- [Contributing](./CONTRIBUTING.md)
- [Security](./SECURITY.md)

---

## 🧩 Examples

Lihat folder `examples/` untuk contoh implementasi:

- [Basic CRUD](./examples/basic-crud/) - Complete CRUD dengan pagination & search
- [Real-time](./examples/realtime/) - Server-Sent Events implementation
- [File Upload](./examples/file-upload/) - Multi-file upload dengan progress

---

## 🔑 Key Features

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

---

## 🏗️ Creating a Feature

```bash
mkdir -p src/features/invoices/pages
touch src/features/invoices/{api.ts,service.ts,repository.ts}
touch src/features/invoices/pages/Index.svelte
```

See [Creating Features Guide](./docs/guides/creating-features.md) for detailed walkthrough.

---

## 🧪 Testing

```bash
# E2E tests (requires Node.js)
npx playwright test

# Type checking
bun run typecheck

# Unit tests (with Bun)
bun test
```

---

## 📦 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to secure random string (32+ chars)
3. Build assets: `bun run build`
4. Run migrations: `bun run db:migrate`
5. Start: `bun src/bootstrap.ts`

### Docker Compose

**⚠️ Warning: Docker deployment has 30-70s downtime per deploy** (build time). For faster deploys (3-5s), use PM2 native deployment.

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./db:/app/db          # Database (WAL mode: 3 files)
      - ./storage:/app/storage # Uploads & backups
    restart: unless-stopped
```

**Deployment Comparison:**

| Method | Downtime | Best For |
|--------|----------|----------|
| PM2 (Native) | 3-5s | Production, frequent deploys |
| Docker | 30-70s | Testing, CI/CD, isolation |

**SQLite WAL Mode Note:**
Database uses 3 files (`.sqlite`, `.sqlite-wal`, `.sqlite-shm`). All are persisted via volume mount. Backup service creates single-file backups via WAL checkpoint.

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Contributing Guide

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 🛡️ Security

For security issues, please email **security@velist.dev** instead of using the issue tracker.

See [SECURITY.md](./SECURITY.md) for:
- Reporting vulnerabilities
- Security best practices
- Supported versions

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Elysia](https://elysiajs.com/) - The excellent Bun web framework
- [Inertia.js](https://inertiajs.com/) - The modern monolithic pattern
- [Svelte](https://svelte.dev/) - The magical disappearing UI framework
- [Kysely](https://kysely.dev/) - The type-safe SQL query builder

---

<p align="center">
  Built with ❤️ by the Velist team
</p>

<p align="center">
  <a href="https://twitter.com/veliststack">Twitter</a> •
  <a href="https://discord.gg/velistdev">Discord</a> •
  <a href="https://velist.dev">Website</a>
</p>
