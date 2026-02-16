# Installation Guide

## Prerequisites

- [Bun](https://bun.sh/) v1.1.0 or higher
- Git
- (Optional) Node.js for Playwright E2E tests

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/eisk-stack.git my-app
cd my-app

# 2. Install dependencies
bun install

# 3. Setup environment
cp .env.example .env

# 4. Setup database
bun run db:migrate
bun run db:seed

# 5. Start development
bun run dev
```

Your application will be available at:
- Backend: http://localhost:3000
- Frontend (Vite): http://localhost:5173

## Detailed Setup

### 1. Installing Bun

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (via WSL):**
```bash
# Install WSL2 first, then run the macOS/Linux command above
```

Verify installation:
```bash
bun --version  # Should show 1.1.0 or higher
```

### 2. Project Setup

Create a new project:

```bash
# Option 1: Clone template
git clone https://github.com/your-username/eisk-stack.git my-app

# Option 2: Use degit
npx degit your-username/eisk-stack my-app
```

### 3. Environment Configuration

Edit `.env` file:

```bash
NODE_ENV=development
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=your-development-secret-min-32-chars
FRONTEND_URL=http://localhost:5173
```

**Important:** Change `JWT_SECRET` in production!

### 4. Database Setup

The project uses SQLite via `bun:sqlite`.

```bash
# Run migrations
bun run db:migrate

# Seed with sample data (optional)
bun run db:seed

# Reset everything
bun run db:refresh
```

Default login after seeding:
- Email: `admin@example.com`
- Password: `password123`

### 5. Development Server

```bash
# Start both backend and frontend
bun run dev

# Or start separately:
bun run dev:server  # Backend only
bun run dev:client  # Frontend only
```

## IDE Setup

### VS Code Extensions

Recommended extensions:

- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [TypeScript Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

### Cursor IDE

EISK Stack includes `.cursorrules` file for AI assistance:

1. Open project in Cursor
2. AI will automatically follow patterns from `.cursorrules`
3. Use `@file` mentions to reference AGENTS.md for context

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Database Locked

```bash
# Kill all Bun processes
pkill -f bun

# Remove database lock
rm db/*.sqlite-journal

# Restart
bun run db:migrate
```

### Permission Denied (Linux/macOS)

```bash
# Fix permissions
chmod +x scripts/*.ts

# Or run with explicit bun
bun run dev
```

### Windows Issues

If you encounter issues on Windows:
1. Use WSL2 (recommended)
2. Or use Git Bash with proper path handling
3. Ensure Bun is in your PATH

## Next Steps

- Read [Project Structure](./structure.md)
- Create your [First Feature](./creating-features.md)
- Learn about [Authentication](./authentication.md)

## Getting Help

- Check [FAQ](#) (coming soon)
- Join [Discord community]()
- Open [GitHub Issue](https://github.com/your-username/eisk-stack/issues)
