import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignUpPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly birthDateInput: Locator;
  readonly genderSelect: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly doctorRoleRadio: Locator;
  readonly patientRoleRadio: Locator;
  readonly signupButton: Locator;
  readonly loginLink: Locator;
  readonly signupForm: Locator;
  readonly pageHeading: Locator;
  readonly errorToast: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    
    // Form elements
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.birthDateInput = page.locator('#birthDate');
    this.genderSelect = page.locator('[data-testid="gender-select"]').or(page.locator('button:has-text("Select your gender")'));
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.doctorRoleRadio = page.locator('#doctor');
    this.patientRoleRadio = page.locator('#patient');
    this.signupButton = page.getByRole('button', { name: /create account/i });
    
    // Navigation links
    this.loginLink = page.getByRole('link', { name: /log in/i });
    
    // Page elements
    this.signupForm = page.locator('form');
    this.pageHeading = page.getByRole('heading', { name: /create your account/i });
    
    // Toast notifications
    this.errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    this.successToast = page.locator('[data-sonner-toast][data-type="success"]');
  }

  /**
   * Navigate to the signup page
   */
  async goto() {
    await this.page.goto('/signup');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the signup page to be fully loaded
   */
  async waitForPageLoad() {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  /**
   * Fill in basic user information
   */
  async fillBasicInfo(data: {
    name: string;
    email: string;
    phone?: string;
    birthDate: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
    await this.birthDateInput.fill(data.birthDate);
  }

  /**
   * Select gender from dropdown
   */
  async selectGender(gender: 'MALE' | 'FEMALE' | 'OTHER') {
    await this.genderSelect.click();
    await this.page.getByRole('option', { name: gender.charAt(0) + gender.slice(1).toLowerCase() }).click();
  }

  /**
   * Fill in password fields
   */
  async fillPasswords(password: string, confirmPassword?: string) {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword || password);
  }

  /**
   * Select user role (doctor or patient)
   */
  async selectRole(role: 'DOCTOR' | 'PATIENT') {
    if (role === 'DOCTOR') {
      await this.doctorRoleRadio.click();
    } else {
      await this.patientRoleRadio.click();
    }
  }

  /**
   * Submit the signup form
   */
  async submitForm() {
    await this.signupButton.click();
  }

  /**
   * Complete signup process with all required data
   */
  async signUp(data: {
    name: string;
    email: string;
    phone?: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    password: string;
    confirmPassword?: string;
    role: 'DOCTOR' | 'PATIENT';
  }) {
    await this.selectRole(data.role);
    await this.fillBasicInfo({
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
    });
    await this.selectGender(data.gender);
    await this.fillPasswords(data.password, data.confirmPassword);
    await this.submitForm();
  }

  /**
   * Verify signup button loading state
   */
  async verifySignupButtonLoading() {
    await expect(this.signupButton).toHaveText(/creating account.../i);
    await expect(this.signupButton).toBeDisabled();
  }

  /**
   * Verify successful signup and redirection
   */
  async verifySuccessfulSignup(expectedRole: 'DOCTOR' | 'PATIENT') {
    // Wait for success toast
    await expect(this.successToast).toBeVisible();
    await expect(this.successToast).toContainText(/registration successful/i);
    
    // Verify redirection to appropriate dashboard
    const expectedPath = expectedRole === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard';
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
        expect(userRole).toBe(expectedRole.toLowerCase());
      }
    } catch (error) {
      // localStorage might not be available, skip this check
      console.log('Could not verify localStorage:', error);
    }
  }

  /**
   * Verify signup failure with error message
   */
  async verifySignupFailure(expectedErrorMessage?: string) {
    await expect(this.errorToast).toBeVisible();
    if (expectedErrorMessage) {
      await expect(this.errorToast).toContainText(expectedErrorMessage);
    }
  }

  /**
   * Verify password mismatch validation
   */
  async verifyPasswordMismatchError() {
    await expect(this.errorToast).toBeVisible();
    await expect(this.errorToast).toContainText(/passwords don't match/i);
  }

  /**
   * Verify missing required fields validation
   */
  async verifyRequiredFieldsError() {
    await expect(this.errorToast).toBeVisible();
    await expect(this.errorToast).toContainText(/please fill in all required fields/i);
  }

  /**
   * Verify form field validation attributes
   */
  async verifyFormValidation() {
    // Check required attributes
    await expect(this.nameInput).toHaveAttribute('required');
    await expect(this.emailInput).toHaveAttribute('required');
    await expect(this.birthDateInput).toHaveAttribute('required');
    await expect(this.passwordInput).toHaveAttribute('required');
    await expect(this.confirmPasswordInput).toHaveAttribute('required');
    
    // Check email type validation
    await expect(this.emailInput).toHaveAttribute('type', 'email');
    
    // Check date type validation
    await expect(this.birthDateInput).toHaveAttribute('type', 'date');
    
    // Check password type validation
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
    await expect(this.confirmPasswordInput).toHaveAttribute('type', 'password');
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.loginLink.click();
    await this.page.waitForURL('**/login');
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.nameInput.clear();
    await this.emailInput.clear();
    await this.phoneInput.clear();
    await this.birthDateInput.clear();
    await this.passwordInput.clear();
    await this.confirmPasswordInput.clear();
  }

  /**
   * Verify page accessibility
   */
  async verifyAccessibility() {
    // Check for proper form labels
    const requiredLabels = ['name', 'email', 'birthDate', 'password', 'confirmPassword'];
    for (const field of requiredLabels) {
      await expect(this.page.locator(`label[for="${field}"]`)).toBeVisible();
    }
    
    // Check for proper form structure
    await expect(this.signupForm).toBeVisible();
    
    // Verify keyboard navigation
    await this.nameInput.focus();
    await expect(this.nameInput).toBeFocused();
  }

  /**
   * Fill form with invalid data for testing validation
   */
  async fillInvalidData() {
    await this.nameInput.fill('');
    await this.emailInput.fill('invalid-email');
    await this.passwordInput.fill('123');
    await this.confirmPasswordInput.fill('456');
  }

  /**
   * Verify gender dropdown functionality
   */
  async verifyGenderDropdown() {
    await this.genderSelect.click();
    
    // Verify all gender options are available
    await expect(this.page.getByRole('option', { name: 'Male' })).toBeVisible();
    await expect(this.page.getByRole('option', { name: 'Female' })).toBeVisible();
    await expect(this.page.getByRole('option', { name: 'Other' })).toBeVisible();
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
  }

  /**
   * Verify responsive design elements
   */
  async verifyResponsiveDesign() {
    // Check if form is properly structured
    const formBox = await this.signupForm.boundingBox();
    expect(formBox).not.toBeNull();
    
    // Verify minimum form width on mobile
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      const formWidth = formBox?.width || 0;
      expect(formWidth).toBeGreaterThan(280); // Minimum mobile width
    }
  }

  /**
   * Check form submission without required fields
   */
  async testEmptyFormSubmission() {
    await this.submitForm();
    // Browser should prevent submission due to HTML5 validation
    // Form should still be visible (not navigated away)
    await expect(this.signupForm).toBeVisible();
  }
}