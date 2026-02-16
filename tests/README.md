# Testing

## E2E Testing with Playwright

> ⚠️ **Note**: Playwright requires Node.js to run (not compatible with Bun). Make sure you have Node.js installed.

### Prerequisites

```bash
# Install Node.js if not already installed
# https://nodejs.org/

# Install dependencies with npm
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Run tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts
```

### Test Structure

- `tests/e2e/` - End-to-end tests
  - `auth.spec.ts` - Authentication tests (register, login, logout)
  - `global-setup.ts` - Test setup
  - `global-teardown.ts` - Test cleanup

### Test Coverage

#### Authentication Tests

1. **Display login page** - Verify login form loads correctly
2. **Register new user** - Successful registration flow
3. **Register with existing email** - Error handling for duplicate email
4. **Login with valid credentials** - Successful login flow
5. **Login with invalid credentials** - Error handling for wrong password
6. **Login with missing fields** - Form validation
7. **Logout** - Successful logout flow
8. **Remember me** - Cookie persistence

### Environment

Tests automatically:
- Start dev server on port 3000 using Bun
- Use separate test database (`db/test.sqlite`)
- Clean up after tests
- Run migrations before tests

### Configuration

**playwright.config.ts**:
- Uses Node.js/npm to run tests
- Bun is only used for the dev server
- Test database: `db/test.sqlite`

### Debugging

```bash
# Run with Playwright inspector
npx playwright test --debug

# Show browser during test
npx playwright test --headed

# Slow motion
npx playwright test --slow-mo 1000
```

### Screenshots & Videos

Failed tests automatically capture:
- Screenshots in `test-results/`
- Trace files for debugging

To view trace:
```bash
npx playwright show-trace test-results/trace.zip
```

### Known Issues

- Playwright doesn't support Bun runtime, use Node.js instead
- Tests may fail if port 3000 is already in use
