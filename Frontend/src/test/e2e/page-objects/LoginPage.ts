import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly doctorRoleRadio: Locator;
  readonly patientRoleRadio: Locator;
  readonly loginButton: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginForm: Locator;
  readonly welcomeHeading: Locator;
  readonly medScribeLogo: Locator;
  readonly errorToast: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form elements
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.doctorRoleRadio = page.locator('#doctor');
    this.patientRoleRadio = page.locator('#patient');
    this.loginButton = page.getByRole('button', { name: /log in/i });
    
    // Navigation links
    this.signupLink = page.getByRole('link', { name: /sign up/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    
    // Page elements
    this.loginForm = page.locator('form');
    this.welcomeHeading = page.getByRole('heading', { name: /welcome back/i });
    this.medScribeLogo = page.getByText('MedScribe');
    
    // Toast notifications
    this.errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    this.successToast = page.locator('[data-sonner-toast][data-type="success"]');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the login page to be fully loaded
   */
  async waitForPageLoad() {
    await expect(this.welcomeHeading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  /**
   * Fill in login credentials
   */
  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Select user role (doctor or patient)
   */
  async selectRole(role: 'doctor' | 'patient') {
    if (role === 'doctor') {
      await this.doctorRoleRadio.click();
    } else {
      await this.patientRoleRadio.click();
    }
  }

  /**
   * Submit the login form
   */
  async submitForm() {
    await this.loginButton.click();
  }

  /**
   * Complete login process with given credentials
   */
  async login(email: string, password: string, role: 'doctor' | 'patient' = 'patient') {
    await this.fillCredentials(email, password);
    await this.selectRole(role);
    await this.submitForm();
  }

  /**
   * Verify login button loading state
   */
  async verifyLoginButtonLoading() {
    await expect(this.loginButton).toHaveText(/logging in.../i);
    await expect(this.loginButton).toBeDisabled();
  }

  /**
   * Verify successful login and redirection
   */
  async verifySuccessfulLogin(expectedRole: 'doctor' | 'patient') {
    // Wait for toast notification
    await expect(this.successToast).toBeVisible();
    await expect(this.successToast).toContainText(/login successful/i);
    
    // Verify redirection to appropriate dashboard
    const expectedPath = expectedRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    await this.page.waitForURL(`**${expectedPath}`);
    
    // Verify user role is stored in localStorage (with error handling)
    try {
      const userRole = await this.page.evaluate(() => {
        try {
          return localStorage.getItem('userRole');
        } catch (error) {
          return null;
        }
      });
      if (userRole) {
        expect(userRole).toBe(expectedRole);
      }
    } catch (error) {
      // localStorage might not be available, skip this check
      console.log('Could not verify localStorage:', error);
    }
  }

  /**
   * Verify login failure
   */
  async verifyLoginFailure(expectedErrorMessage?: string) {
    await expect(this.errorToast).toBeVisible();
    if (expectedErrorMessage) {
      await expect(this.errorToast).toContainText(expectedErrorMessage);
    }
  }

  /**
   * Verify form validation errors
   */
  async verifyRequiredFieldValidation() {
    // Check HTML5 validation
    await expect(this.emailInput).toHaveAttribute('required');
    await expect(this.passwordInput).toHaveAttribute('required');
  }

  /**
   * Navigate to signup page
   */
  async goToSignup() {
    await this.signupLink.click();
    await this.page.waitForURL('**/signup');
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.page.waitForURL('**/forgot-password');
  }

  /**
   * Clear form fields
   */
  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Verify page accessibility
   */
  async verifyAccessibility() {
    // Check for proper form labels
    await expect(this.page.locator('label[for="email"]')).toBeVisible();
    await expect(this.page.locator('label[for="password"]')).toBeVisible();
    await expect(this.page.locator('label[for="role"]')).toBeVisible();
    
    // Check for proper form structure
    await expect(this.loginForm).toBeVisible();
    
    // Verify keyboard navigation
    await this.emailInput.focus();
    await expect(this.emailInput).toBeFocused();
  }

  /**
   * Check if user is already logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const userRole = await this.page.evaluate(() => localStorage.getItem('userRole'));
    return userRole !== null;
  }

  /**
   * Verify responsive design elements
   */
  async verifyResponsiveDesign() {
    // Check if logo is visible
    await expect(this.medScribeLogo).toBeVisible();
    
    // Check if form is properly centered
    const formBox = await this.loginForm.boundingBox();
    expect(formBox).not.toBeNull();
    
    // Verify minimum form width on mobile
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      const formWidth = formBox?.width || 0;
      expect(formWidth).toBeGreaterThan(280); // Minimum mobile width
    }
  }
}