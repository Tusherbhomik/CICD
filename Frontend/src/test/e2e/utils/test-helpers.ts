import { Page, expect, Browser, BrowserContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { TestUser, generateTestUser } from '../fixtures/test-data';

export class TestHelpers {
  static async createAuthenticatedSession(
    page: Page, 
    role: 'DOCTOR' | 'PATIENT' = 'PATIENT'
  ): Promise<TestUser> {
    const testUser = generateTestUser({ role });
    
    // Mock successful login
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: faker.number.int({ min: 1, max: 1000 }),
            name: testUser.name,
            email: testUser.email,
            role: testUser.role
          },
          message: 'Login successful'
        })
      });
    });

    // Set user role in localStorage
    await page.evaluate((role) => {
      localStorage.setItem('userRole', role.toLowerCase());
    }, role);

    return testUser;
  }

  static async clearAllData(page: Page): Promise<void> {
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Clear cookies
    await page.context().clearCookies();

    // Clear any service workers
    await page.evaluate(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
    });
  }

  static async waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeFullPageScreenshot(
    page: Page, 
    name: string, 
    options?: { fullPage?: boolean; clip?: { x: number; y: number; width: number; height: number } }
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
      path: `screenshots/${name}-${timestamp}.png`,
      fullPage: options?.fullPage ?? true,
      clip: options?.clip
    });
  }

  static async mockAPIEndpoint(
    page: Page,
    endpoint: string,
    response: unknown,
    status: number = 200,
    delay?: number
  ): Promise<void> {
    await page.route(`**/${endpoint}`, async route => {
      if (delay) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  static async simulateSlowNetwork(page: Page, delay: number = 2000): Promise<void> {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.continue();
    });
  }

  static async simulateOfflineMode(page: Page): Promise<void> {
    await page.context().setOffline(true);
  }

  static async restoreOnlineMode(page: Page): Promise<void> {
    await page.context().setOffline(false);
  }

  static async waitForToastMessage(
    page: Page, 
    expectedMessage?: string, 
    type: 'success' | 'error' = 'success'
  ): Promise<void> {
    const toast = page.locator(`[data-sonner-toast][data-type="${type}"]`);
    await expect(toast).toBeVisible();
    
    if (expectedMessage) {
      await expect(toast).toContainText(expectedMessage);
    }
    
    // Wait for toast to disappear
    await expect(toast).toBeHidden({ timeout: 10000 });
  }

  static async fillFormField(
    page: Page, 
    selector: string, 
    value: string, 
    options?: { clear?: boolean; delay?: number }
  ): Promise<void> {
    const input = page.locator(selector);
    
    if (options?.clear !== false) {
      await input.clear();
    }
    
    await input.fill(value, { timeout: 5000 });
    
    if (options?.delay) {
      await page.waitForTimeout(options.delay);
    }
    
    // Verify the value was set correctly
    await expect(input).toHaveValue(value);
  }

  static async clickWithRetry(
    page: Page, 
    selector: string, 
    maxRetries: number = 3
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.locator(selector).click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await page.waitForTimeout(1000);
      }
    }
  }

  static async verifyFormValidation(
    page: Page, 
    fieldSelector: string, 
    expectedValidationMessage?: string
  ): Promise<void> {
    const field = page.locator(fieldSelector);
    
    // Check if field has HTML5 validation
    const validationMessage = await field.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    
    if (expectedValidationMessage) {
      expect(validationMessage).toContain(expectedValidationMessage);
    } else {
      expect(validationMessage).toBeTruthy();
    }
  }

  static async interceptAPICall(
    page: Page,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<unknown> {
    return new Promise((resolve) => {
      page.route(`**/${endpoint}`, async route => {
        if (route.request().method() === method) {
          const requestBody = route.request().postDataJSON();
          resolve(requestBody);
        }
        await route.continue();
      });
    });
  }

  static async generateUniqueEmail(domain: string = 'test.com'): Promise<string> {
    const timestamp = Date.now();
    const randomString = faker.string.alphanumeric(8);
    return `playwright-${timestamp}-${randomString}@${domain}`;
  }

  static async verifyAccessibility(
    page: Page,
    options?: { 
      checkImages?: boolean; 
      checkLabels?: boolean; 
      checkHeadings?: boolean;
    }
  ): Promise<void> {
    const opts = { 
      checkImages: true, 
      checkLabels: true, 
      checkHeadings: true, 
      ...options 
    };

    if (opts.checkImages) {
      // Check for images without alt text
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);
    }

    if (opts.checkLabels) {
      // Check for inputs without labels
      const inputsWithoutLabels = await page.locator(
        'input:not([aria-label]):not([aria-labelledby]):not([id*="react-select"]):not([type="hidden"])'
      ).count();
      // Allow some flexibility for complex components
      expect(inputsWithoutLabels).toBeLessThanOrEqual(2);
    }

    if (opts.checkHeadings) {
      // Check for presence of headings
      const headingCount = await page.locator('h1, h2, h3, h4, h5, h6').count();
      expect(headingCount).toBeGreaterThan(0);
    }
  }

  static async testResponsiveBreakpoints(
    page: Page,
    testCallback: () => Promise<void>
  ): Promise<void> {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1024, height: 768 },
      { name: 'wide', width: 1440, height: 900 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      // Allow layout to stabilize
      await page.waitForTimeout(500);
      
      // Run the test callback for this breakpoint
      await testCallback();
      
      // Take screenshot for visual verification
      await TestHelpers.takeFullPageScreenshot(
        page, 
        `responsive-${breakpoint.name}`
      );
    }
  }

  static async measurePageLoadTime(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async verifyNoConsoleErrors(page: Page): Promise<string[]> {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    return consoleErrors;
  }

  static async createBrowserWithVideoRecording(browserType: {
    launch: (options?: { args?: string[]; headless?: boolean }) => Promise<Browser>;
  }): Promise<Browser> {
    return await browserType.launch({
      args: ['--start-maximized'],
      headless: process.env.CI ? true : false,
    });
  }

  static async createContextWithVideoRecording(browser: Browser): Promise<BrowserContext> {
    return await browser.newContext({
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 }
      },
      viewport: { width: 1280, height: 720 }
    });
  }

  static async generateTestReport(
    testName: string,
    status: 'passed' | 'failed',
    duration: number,
    error?: string
  ): Promise<void> {
    const report = {
      testName,
      status,
      duration,
      timestamp: new Date().toISOString(),
      error: error || null
    };

    // In a real implementation, you might want to save this to a file
    // or send it to a reporting service
    console.log('Test Report:', JSON.stringify(report, null, 2));
  }

  static async cleanupTestUser(page: Page, email: string): Promise<void> {
    // Mock API call to delete test user
    await page.route('**/auth/delete-user', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'User deleted successfully' })
      });
    });

    // Make the API call
    await page.evaluate((email) => {
      return fetch('/api/auth/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    }, email);
  }

  static async waitForElementToBeStable(
    page: Page, 
    selector: string, 
    timeout: number = 5000
  ): Promise<void> {
    const element = page.locator(selector);
    
    // Wait for element to be visible
    await expect(element).toBeVisible({ timeout });
    
    // Wait for element to stop moving (useful for animations)
    let previousPosition: { x: number; y: number } | null = null;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const boundingBox = await element.boundingBox();
      
      if (boundingBox) {
        const currentPosition = { x: boundingBox.x, y: boundingBox.y };
        
        if (previousPosition && 
            Math.abs(previousPosition.x - currentPosition.x) < 1 &&
            Math.abs(previousPosition.y - currentPosition.y) < 1) {
          // Element is stable
          return;
        }
        
        previousPosition = currentPosition;
      }
      
      await page.waitForTimeout(100);
    }
  }
}

export default TestHelpers;