# Testing Guide

EISK Stack supports multiple testing approaches for comprehensive coverage.

## Testing Strategy

| Type | Tool | Purpose |
|------|------|---------|
| E2E | Playwright | Full user journeys |
| Unit | Bun:test | Business logic |
| Integration | Bun:test | API + Database |

## E2E Testing with Playwright

### Setup

```bash
# Playwright requires Node.js
npx playwright install
```

### Project Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts      # Authentication flows
│   ├── tasks.spec.ts     # Feature-specific tests
│   └── setup.ts          # Global setup
├── fixtures/
│   └── users.ts          # Test data
└── utils/
    └── test-helpers.ts   # Shared utilities
```

### Writing E2E Tests

```typescript
// tests/e2e/tasks.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Tasks Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*dashboard.*/)
  })

  test('should create a new task', async ({ page }) => {
    await page.goto('/tasks/create')
    
    // Fill form
    await page.fill('input[name="title"]', 'Test Task')
    await page.fill('textarea[name="description"]', 'This is a test task')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Verify redirect and task appears
    await expect(page).toHaveURL('/tasks')
    await expect(page.locator('text=Test Task')).toBeVisible()
  })

  test('should mark task as complete', async ({ page }) => {
    // Create task first
    await page.goto('/tasks/create')
    await page.fill('input[name="title"]', 'Task to Complete')
    await page.click('button[type="submit"]')
    
    // Mark as complete
    await page.click('[data-testid="toggle-task"]')
    
    // Verify strikethrough or completed state
    await expect(page.locator('text=Task to Complete')).toHaveClass(/line-through/)
  })

  test('should delete a task', async ({ page }) => {
    // Create and delete
    await page.goto('/tasks/create')
    await page.fill('input[name="title"]', 'Task to Delete')
    await page.click('button[type="submit"]')
    
    // Delete
    await page.click('[data-testid="delete-task"]')
    
    // Confirm dialog
    page.on('dialog', dialog => dialog.accept())
    
    // Verify removed
    await expect(page.locator('text=Task to Delete')).not.toBeVisible()
  })
})
```

### Test Data Management

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'password123'
  },
  regular: {
    email: 'user@example.com',
    password: 'userpass123'
  }
}

// tests/utils/auth.ts
import { Page } from '@playwright/test'
import { testUsers } from '../fixtures/users'

export async function login(page: Page, userType: keyof typeof testUsers = 'admin') {
  const user = testUsers[userType]
  await page.goto('/auth/login')
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.click('button[type="submit"]')
}

export async function logout(page: Page) {
  await page.click('text=Logout')
}
```

### Running E2E Tests

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test tasks.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate report
npx playwright show-report
```

### E2E Best Practices

1. **Use data-testid attributes**:
   ```svelte
   <button data-testid="delete-task" onclick={deleteTask}>
     <Trash class="w-4 h-4" />
   </button>
   ```

2. **Isolate tests** - Each test should be independent

3. **Use fixtures for setup**:
   ```typescript
   test('example', async ({ page, authenticatedPage }) => {
     // Start already logged in
     await authenticatedPage.goto('/dashboard')
   })
   ```

## Unit Testing with Bun

### Setup

Bun has built-in test runner - no additional setup needed.

### Writing Unit Tests

```typescript
// tests/unit/auth.service.test.ts
import { describe, it, expect, beforeEach } from 'bun:test'
import { AuthService } from '../../src/features/_core/auth/service'

// Mock repository
class MockAuthRepository {
  users: any[] = []
  
  async findByEmail(email: string) {
    return this.users.find(u => u.email === email) || null
  }
  
  async create(data: any) {
    const user = { id: 'test-id', ...data }
    this.users.push(user)
    return user
  }
}

describe('AuthService', () => {
  let service: AuthService
  let mockRepo: MockAuthRepository
  
  beforeEach(() => {
    mockRepo = new MockAuthRepository()
    service = new AuthService(mockRepo as any)
  })
  
  describe('register', () => {
    it('should register a new user', async () => {
      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      })
      
      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
      expect(result).not.toHaveProperty('password_hash')
    })
    
    it('should reject mismatched passwords', async () => {
      expect(service.register({
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'different',
        name: 'Test User'
      })).rejects.toThrow('Password confirmation does not match')
    })
    
    it('should reject duplicate email', async () => {
      // Register first user
      await service.register({
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      })
      
      // Try to register again
      expect(service.register({
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Another User'
      })).rejects.toThrow('Email already registered')
    })
  })
  
  describe('attempt', () => {
    beforeEach(async () => {
      await service.register({
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        name: 'Test User'
      })
    })
    
    it('should login with valid credentials', async () => {
      const user = await service.attempt('test@example.com', 'password123')
      expect(user.email).toBe('test@example.com')
    })
    
    it('should reject invalid password', async () => {
      expect(service.attempt('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })
    
    it('should reject non-existent user', async () => {
      expect(service.attempt('nonexistent@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials')
    })
  })
})
```

### Running Unit Tests

```bash
# Run all tests
bun test

# Run specific file
bun test tests/unit/auth.service.test.ts

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch
```

## Integration Testing

Test API endpoints with real database.

```typescript
// tests/integration/tasks.api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { Elysia } from 'elysia'
import { taskApi } from '../../src/features/tasks/api'
import { db } from '../../src/features/_core/database/connection'

describe('Tasks API Integration', () => {
  let app: Elysia
  let authCookie: string
  
  beforeAll(async () => {
    // Setup test database
    process.env.DATABASE_URL = './db/test-integration.sqlite'
    
    // Run migrations
    await import('../../src/features/_core/database/migrations/runner')
    
    // Create test user and get auth cookie
    // ... setup code
    
    app = new Elysia().use(taskApi)
  })
  
  afterAll(async () => {
    // Cleanup
    await db.destroy()
    // Remove test database
    await Bun.file('./db/test-integration.sqlite').delete()
  })
  
  it('should create a task', async () => {
    const response = await app.handle(
      new Request('http://localhost/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          title: 'Integration Test Task',
          description: 'Test description'
        })
      })
    )
    
    expect(response.status).toBe(302) // Redirect
  })
  
  it('should validate task input', async () => {
    const response = await app.handle(
      new Request('http://localhost/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          title: '', // Invalid - empty
          description: 'Test'
        })
      })
    )
    
    expect(response.status).toBe(422) // Validation error
  })
})
```

## Test Database Strategy

### Separate Test Database

```typescript
// tests/setup/database.ts
import { Database } from 'bun:sqlite'
import { Kysely } from 'kysely'
import { BunSqliteDialect } from 'kysely-bun-sqlite'

export function createTestDatabase() {
  const testDbPath = `./db/test-${Date.now()}.sqlite`
  const sqlite = new Database(testDbPath, { create: true })
  
  return {
    db: new Kysely({
      dialect: new BunSqliteDialect({ database: sqlite })
    }),
    cleanup: async () => {
      await sqlite.close()
      await Bun.file(testDbPath).delete()
    }
  }
}
```

### Transaction Rollback

```typescript
// tests/setup/transaction.ts
export async function withTransaction<T>(
  db: Kysely<DatabaseSchema>,
  fn: (trx: Transaction<DatabaseSchema>) => Promise<T>
): Promise<T> {
  return db.transaction().execute(async (trx) => {
    try {
      const result = await fn(trx)
      // Always rollback in tests
      throw new Error('ROLLBACK')
    } catch (error) {
      if (error.message === 'ROLLBACK') {
        return undefined as T
      }
      throw error
    }
  })
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Type check
        run: bun run typecheck
      
      - name: Run unit tests
        run: bun test
      
      - name: Setup test database
        run: |
          bun run db:migrate
          bun run db:seed
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Checklist

### Unit Tests
- [ ] Business logic in services
- [ ] Data transformation
- [ ] Utility functions
- [ ] Edge cases and error handling

### Integration Tests
- [ ] API endpoints
- [ ] Database queries
- [ ] Authentication flow
- [ ] Validation logic

### E2E Tests
- [ ] Complete user journeys
- [ ] Form submissions
- [ ] Navigation flows
- [ ] Error scenarios
- [ ] Responsive design (mobile/desktop)

## Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Services | 90% |
| Repositories | 80% |
| API Routes | 70% |
| E2E Flows | Critical paths |

## Best Practices

1. **Test behavior, not implementation**
2. **One assertion per test** (ideally)
3. **Descriptive test names** - explain the "why"
4. **Arrange-Act-Assert** pattern
5. **Keep tests fast** - mock slow dependencies
6. **Clean up** - always restore state after tests
