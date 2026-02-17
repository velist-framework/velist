# Contributing to Velist

Thank you for your interest in contributing to Velist! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Accept responsibility for mistakes

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.1.0 or higher
- Node.js (for Playwright tests only)
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/eisk-stack.git
   cd eisk-stack
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Setup environment:
   ```bash
   cp .env.example .env
   ```

5. Setup database:
   ```bash
   bun run db:migrate
   bun run db:seed
   ```

6. Start development:
   ```bash
   bun run dev
   ```

## Development Workflow

### Creating a New Feature

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Implement your feature following our [coding standards](#coding-standards)

3. Add tests for your feature

4. Run the test suite:
   ```bash
   bun run typecheck
   npx playwright test
   ```

5. Commit your changes following our [commit guidelines](#commit-message-guidelines)

6. Push and create a Pull Request

### Reporting Bugs

When reporting bugs, please include:

- Clear bug description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Bun version, Node version)
- Relevant code snippets or error logs

Use the [GitHub Issues](https://github.com/your-repo/eisk-stack/issues) template.

### Suggesting Features

We welcome feature suggestions! Please:

- Check if the feature was already requested
- Provide clear use case and rationale
- Explain the expected behavior
- Consider implementation approach

## Pull Request Process

1. **Update documentation** if your changes affect usage or setup

2. **Add tests** for new functionality

3. **Ensure all tests pass**:
   ```bash
   bun run typecheck
   npx playwright test
   ```

4. **Update CHANGELOG.md** with your changes under the `[Unreleased]` section

5. **Link related issues** in your PR description

6. **Wait for review** - maintainers will review as soon as possible

### PR Title Format

```
<type>: <short description>

Examples:
feat: add user profile page
fix: correct login redirect bug
docs: update API documentation
refactor: simplify auth middleware
test: add E2E tests for invoices
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `test`: Test additions or fixes
- `chore`: Build process or auxiliary tool changes

## Coding Standards

### TypeScript

- Use strict TypeScript mode
- Prefer explicit types over `any`
- Export types from feature modules
- Use TypeBox for validation schemas

```typescript
// Good
export const UserSchema = t.Object({
  name: t.String({ minLength: 1 })
})
export type User = Static<typeof UserSchema>

// Bad
export type User = any
```

### Vertical Feature Slicing

Always organize by feature, not by layer:

```
✅ Good:
src/features/invoices/
  ├── api.ts
  ├── service.ts
  ├── repository.ts
  └── pages/
      ├── Index.svelte
      └── Create.svelte

❌ Bad:
src/controllers/invoices.ts
src/models/invoices.ts
src/views/invoices/
```

### Svelte 5

- Use runes: `$props()`, `$state()`, `$derived()`, `$effect()`
- Use TypeScript for all components
- Inline Tailwind classes (no atomic components)
- Use `lucide-svelte` for icons

```svelte
<script lang="ts">
  interface Props {
    items: Item[]
  }
  
  let { items }: Props = $props()
  let search = $state('')
  let filtered = $derived(items.filter(i => i.name.includes(search)))
</script>
```

### Database

- Use UUID v7 for all IDs
- Use snake_case for column names
- Use ISO strings for timestamps
- Repository pattern for data access

```typescript
// Good
const id = uuidv7()
const now = new Date().toISOString()

// Bad
const id = autoIncrement()
const now = new Date()
```

### Styling

- Use Tailwind CSS v4
- No component abstractions for simple UI
- Support dark mode with `dark:` prefix
- Use semantic color names

```svelte
<!-- Good -->
<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  Save
</button>

<!-- Bad -->
<Button variant="primary" size="md">Save</Button>
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, missing semicolons, etc
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or fixing tests
- **chore**: Build process or auxiliary tool changes

### Examples

```
feat(auth): add password reset functionality

Implement password reset flow with email token verification.
Includes new routes, service methods, and email templates.

fix(database): resolve connection pooling issue

Prevent SQLite "too many connections" error by properly
closing connections after each request.

docs(readme): update installation instructions

Add Docker setup steps and troubleshooting section.
```

## Testing

### Running Tests

```bash
# Type checking
bun run typecheck

# E2E tests
npx playwright test

# E2E with UI
npx playwright test --ui
```

### Writing Tests

#### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('input[name="email"]', 'user@example.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*dashboard.*/)
})
```

### Test Coverage

- All new features must include E2E tests
- Critical paths should have comprehensive coverage
- Tests should be independent and idempotent

## Documentation

- Update README.md if changing setup or usage
- Update AGENTS.md if changing architecture patterns
- Add JSDoc comments for public APIs
- Include code examples for complex features

## Questions?

- Join our [Discord community]()
- Open a [GitHub Discussion]()
- Email maintainers: maintainers@eisk-stack.dev

Thank you for contributing! 🚀
