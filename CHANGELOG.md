# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- AI context files (`.cursorrules`, `.claude.md`) for better AI-assisted development
- Type-safe Inertia props with `PageProps`, `SharedProps`, and helper types
- Complete documentation suite (LICENSE, CONTRIBUTING, SECURITY, CHANGELOG)
- Documentation folder with comprehensive guides
- Example implementations folder

### Changed
- Enhanced AGENTS.md with detailed step-by-step feature creation guide
- Improved type definitions in `src/types/` directory
- Updated Elysia type declarations for better auth context

## [0.1.0] - 2026-02-16

### Added
- Initial release of EISK Stack
- Elysia backend with custom Inertia.js plugin
- Svelte 5 frontend with runes support
- Authentication system (login, register, logout)
- JWT-based session management with HTTP-only cookies
- SQLite database with Kysely query builder
- Drizzle ORM for migrations
- Tailwind CSS v4 with dark mode support
- Vertical feature slicing architecture
- Password generator and strength indicator
- UUID v7 native implementation
- Playwright E2E tests
- Database migrations and seeders

### Features

#### Core
- Vertical feature slicing architecture
- End-to-end type safety (Database → TypeBox → Svelte props)
- Custom Inertia plugin for Elysia
- Dark mode toggle with persistence

#### Auth
- Registration with email verification ready
- Login with "remember me" functionality
- Password hashing with Bun.password
- Protected routes via auth macro

#### Database
- Kysely + bun-sqlite for runtime queries
- Drizzle for schema management
- Migration runner with automatic execution
- Database seeder with admin user

#### Frontend
- Svelte 5 with runes
- Inertia.js 2 for SPA experience
- Tailwind CSS v4
- Lucide icons
- Form handling with validation

### DevOps
- Bun-based development workflow
- TypeScript strict mode
- Playwright E2E testing
- Database refresh script

---

## Release Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```
