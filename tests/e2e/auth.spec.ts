import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const testPassword = 'password123';

  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    await page.goto('/auth/register');
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="password_confirmation"]', testPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show login page with success message (not redirect)
    await expect(page.locator('text=Registration successful')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should not register with existing email', async ({ page }) => {
    const uniqueEmail = `existing-${Date.now()}@example.com`;
    
    // First register a user
    await page.goto('/auth/register');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="password_confirmation"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Should show login page with success
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Try register again with same email
    await page.goto('/auth/register');
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="password_confirmation"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Should show error on register page
    await expect(page.locator('text=Email already registered')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register
    await page.goto('/auth/register');
    const loginEmail = `login-${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', 'Login Test');
    await page.fill('input[name="email"]', loginEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="password_confirmation"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Should show login page
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Now login
    await page.fill('input[name="email"]', loginEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should not login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should stay on login page with error
    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should not login with missing fields', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try submit empty form - HTML5 validation should prevent it
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should logout successfully', async ({ page }) => {
    // Register and login first
    await page.goto('/auth/register');
    const logoutEmail = `logout-${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', 'Logout Test');
    await page.fill('input[name="email"]', logoutEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="password_confirmation"]', testPassword);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Login
    await page.fill('input[name="email"]', logoutEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Logout
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('should remember user with remember me', async ({ page, context }) => {
    // Register
    await page.goto('/auth/register');
    const rememberEmail = `remember-${Date.now()}@example.com`;
    
    await page.fill('input[name="name"]', 'Remember Test');
    await page.fill('input[name="email"]', rememberEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="password_confirmation"]', testPassword);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Registration successful')).toBeVisible();
    
    // Login with remember me
    await page.fill('input[name="email"]', rememberEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.check('input[name="remember"]');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Check cookie exists
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'auth');
    expect(authCookie).toBeDefined();
    expect(authCookie?.httpOnly).toBe(true);
  });
});
