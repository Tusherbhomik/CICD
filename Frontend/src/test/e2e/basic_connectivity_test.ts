import { test, expect } from '@playwright/test';

test.describe('Basic Connectivity', () => {
  test('should connect to the application', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we can access the page
    expect(page.url()).toContain('localhost:8081');
    
    console.log('✅ Successfully connected to:', page.url());
  });

  test('should navigate to login page', async ({ page }) => {
    // Navigate directly to login
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the login page
    expect(page.url()).toContain('/login');
    
    console.log('✅ Login page loaded:', page.url());
  });

  test('should navigate to signup page', async ({ page }) => {
    // Navigate directly to signup
    await page.goto('/signup');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the signup page
    expect(page.url()).toContain('/signup');
    
    console.log('✅ Signup page loaded:', page.url());
  });

  test('should find basic page elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for common elements that should exist
    const bodyExists = await page.locator('body').count() > 0;
    expect(bodyExists).toBe(true);
    
    // Check if this is a React app (should have a root div)
    const reactRoot = await page.locator('#root, #app, [data-reactroot]').count() > 0;
    if (reactRoot) {
      console.log('✅ React app detected');
    }
    
    // Check for any form elements
    const hasForm = await page.locator('form').count() > 0;
    const hasInputs = await page.locator('input').count() > 0;
    const hasButtons = await page.locator('button').count() > 0;
    
    console.log(`📊 Page elements found: Forms(${hasForm}), Inputs(${hasInputs}), Buttons(${hasButtons})`);
  });
});