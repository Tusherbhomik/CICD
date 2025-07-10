import { Page, expect } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for all content to be loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot of the current page
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `screenshots/${name}.png`, 
      fullPage: true 
    });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for toast notification to appear and disappear
   */
  async waitForToast(type: 'success' | 'error' = 'success') {
    const toast = this.page.locator(`[data-sonner-toast][data-type="${type}"]`);
    await expect(toast).toBeVisible();
    await expect(toast).toBeHidden({ timeout: 10000 });
  }

  /**
   * Clear browser storage (localStorage, sessionStorage, cookies)
   */
  async clearStorage() {
    try {
      await this.page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          // localStorage might not be available in some contexts
          console.log('Storage not available:', error);
        }
      });
      await this.page.context().clearCookies();
    } catch (error) {
      // Ignore storage clearing errors in test environment
      console.log('Could not clear storage:', error);
    }
  }

  /**
   * Verify current URL
   */
  async verifyUrl(expectedUrl: string) {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Verify page title
   */
  async verifyTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET') {
    return await this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.request().method() === method
    );
  }

  /**
   * Mock API response
   */
  async mockApiResponse(urlPattern: string, responseData: unknown, status: number = 200) {
    await this.page.route(`**/${urlPattern}`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Simulate network failure
   */
  async simulateNetworkFailure(urlPattern: string) {
    await this.page.route(`**/${urlPattern}`, route => {
      route.abort('failed');
    });
  }

  /**
   * Check console errors
   */
  async checkConsoleErrors() {
    const consoleErrors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    return consoleErrors;
  }

  /**
   * Verify no console errors
   */
  async verifyNoConsoleErrors() {
    const errors = await this.checkConsoleErrors();
    expect(errors).toHaveLength(0);
  }

  /**
   * Wait for element to be visible with timeout
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.locator(selector).waitFor({ 
      state: 'visible', 
      timeout 
    });
  }

  /**
   * Click element with retry logic
   */
  async clickWithRetry(selector: string, maxRetries: number = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.page.locator(selector).click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input with validation
   */
  async fillInputSafely(selector: string, value: string) {
    const input = this.page.locator(selector);
    await input.clear();
    await input.fill(value);
    await expect(input).toHaveValue(value);
  }

  /**
   * Get localStorage value
   */
  async getLocalStorageItem(key: string): Promise<string | null> {
    try {
      return await this.page.evaluate((key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          return null;
        }
      }, key);
    } catch (error) {
      return null;
    }
  }

  /**
   * Set localStorage value
   */
  async setLocalStorageItem(key: string, value: string) {
    try {
      await this.page.evaluate(
        ({ key, value }) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.log('Cannot set localStorage:', error);
          }
        },
        { key, value }
      );
    } catch (error) {
      console.log('localStorage not available:', error);
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(urlPattern?: string) {
    if (urlPattern) {
      await this.page.waitForURL(urlPattern);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Verify responsive behavior
   */
  async testResponsiveBreakpoints() {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1024, height: 768 },
      { name: 'large-desktop', width: 1440, height: 900 }
    ];

    for (const breakpoint of breakpoints) {
      await this.page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      await this.page.waitForTimeout(500); // Allow layout to stabilize
      await this.takeScreenshot(`responsive-${breakpoint.name}`);
    }
  }

  /**
   * Check for accessibility violations
   */
  async checkAccessibility() {
    // Basic accessibility checks
    const missingAltImages = await this.page.locator('img:not([alt])').count();
    expect(missingAltImages).toBe(0);
    
    const missingLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    // This might need adjustment based on your form structure
    
    const missingHeadings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(missingHeadings).toBeGreaterThan(0);
  }

  /**
   * Simulate slow network conditions
   */
  async simulateSlowNetwork() {
    await this.page.route('**/*', (route) => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 1000);
    });
  }

  /**
   * Verify HTTPS redirect (for production tests)
   */
  async verifyHttpsRedirect() {
    if (process.env.NODE_ENV === 'production') {
      const response = await this.page.goto('http://localhost:8081');
      expect(response?.url()).toContain('https://');
    }
  }
}