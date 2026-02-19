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
  <a href="https://velist.dev">Website</a> •
  <a href="https://velist.dev/docs">Documentation</a> •
  <a href="https://deepwiki.com/velist-framework/velist">DeepWiki</a>
</p>

<p align="center">
  <a href="https://github.com/velist-framework/velist/stargazers">
    <img src="https://img.shields.io/github/stars/velist-framework/velist?style=social" alt="Stars">
  </a>
  <a href="https://github.com/velist-framework/velist/issues">
    <img src="https://img.shields.io/github/issues/velist-framework/velist" alt="Issues">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/velist-framework/velist" alt="License">
  </a>
</p>

---

## ⚡ Quick Start

```bash
bun create velist my-app
cd my-app
cp .env.example .env
bun run db:migrate
bun run db:seed
bun run dev
```

App: http://localhost:3000 | Vite: http://localhost:5173

Default login: `admin@example.com` / `password123`

---

## ✨ Features

- ⚡ **Elysia** — Fast Bun web framework with type-safe validation
- 🔄 **Inertia.js** — SPA without API complexity (custom plugin)
- ⚡ **Svelte 5** — Reactive frontend with runes
- 🎨 **Tailwind CSS v4** — Utility-first styling with dark mode
- 📊 **Kysely + Drizzle** — Type-safe SQL (runtime + migrations)
- 🔐 **Auth Built-in** — JWT, Google OAuth, 2FA
- 🌙 **Dark Mode** — Persistent toggle
- 🧪 **Testing** — Bun unit tests + Playwright E2E
- 🤖 **AI Workflow** — Multi-agent development system

---

## 📊 Performance

| Metric | Velist | Express |
|--------|--------|---------|
| Hello World RPS | **85,703** | ~21,000 |
| Inertia HTML RPS | **66,694** | N/A |
| Memory (idle) | 28MB | 45MB |

*Tested on Mac Mini M4 with `wrk -t12 -c400 -d30s`*

---

## 📁 Project Structure

```
src/
├── features/           # Vertical slices
│   ├── _core/         # Auth, database, storage
│   └── [feature]/     # api.ts, service.ts, repository.ts, pages/
├── shared/            # Libs, layouts, components
├── inertia/           # Inertia plugin & app bootstrap
└── bootstrap.ts       # Entry point
```

**Rule:** 1 feature = API + Service + Repository + Pages in 1 folder.

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:migrate` | Run migrations |
| `bun run db:seed` | Seed database |
| `bun run test` | Run unit tests |
| `bun run test:e2e` | Run Playwright tests |

---

## 🤖 AI Development

Velist uses a **multi-agent workflow** with mandatory review points:

```
@workflow/agents/product.md      → Define requirements
@workflow/agents/tech-lead.md    → Design system
@workflow/agents/developer.md    → Implement code
@workflow/agents/qa.md           → Test & review
@workflow/agents/devops.md       → Deploy
```

See [`@AGENTS.md`](./AGENTS.md) for coding patterns and [`@workflow/README.md`](./workflow/README.md) for workflow guide.

---

## 📚 Documentation

- 📖 **[velist.dev/docs](https://velist.dev/docs)** — Full documentation
- 📘 **[DeepWiki](https://deepwiki.com/velist-framework/velist)** — Comprehensive wiki

---

## 📦 Docker (Production)

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./db:/app/db
      - ./storage:/app/storage
```

See [Deployment Guide](https://velist.dev/guide/production.html) for PM2, Docker, and CI/CD options.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 🛡️ Security

Report vulnerabilities to **security@velist.dev**. See [SECURITY.md](./SECURITY.md).

---

## 📄 License

MIT License — see [LICENSE](./LICENSE).

---

<p align="center">
  Built with ❤️ by the Velist team
</p>

<p align="center">
  <a href="https://twitter.com/veliststack">Twitter</a> •
  <a href="https://discord.gg/velistdev">Discord</a> •
  <a href="https://velist.dev">Website</a>
</p>
