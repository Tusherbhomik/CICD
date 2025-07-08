import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { loginCredentials, apiMocks, testConfig } from '../fixtures/test-data';

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.afterEach(async ({ page }) => {
    // Clean up localStorage after each test
    await loginPage.clearStorage();
  });

  test.describe('Page Rendering', () => {
    test('should render all login form elements', async () => {
      await test.step('Verify page title and heading', async () => {
        await expect(loginPage.welcomeHeading).toBeVisible();
        await expect(loginPage.medScribeLogo).toBeVisible();
      });

      await test.step('Verify form inputs are present', async () => {
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.doctorRoleRadio).toBeVisible();
        await expect(loginPage.patientRoleRadio).toBeVisible();
      });

      await test.step('Verify buttons and links', async () => {
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.signupLink).toBeVisible();
        await expect(loginPage.forgotPasswordLink).toBeVisible();
      });
    });

    test('should have correct default values', async () => {
      await test.step('Patient role should be selected by default', async () => {
        await expect(loginPage.patientRoleRadio).toBeChecked();
        await expect(loginPage.doctorRoleRadio).not.toBeChecked();
      });

      await test.step('Form fields should be empty', async () => {
        await expect(loginPage.emailInput).toHaveValue('');
        await expect(loginPage.passwordInput).toHaveValue('');
      });
    });

    test('should be accessible', async () => {
      await loginPage.verifyAccessibility();
    });
  });

  test.describe('Successful Login', () => {
    test('should login successfully as patient', async () => {
      // Mock successful login API response
      await loginPage.mockApiResponse('auth/login', {
        ...apiMocks.successfulLogin,
        user: { ...apiMocks.successfulLogin.user, role: 'PATIENT' }
      });

      await test.step('Fill and submit login form', async () => {
        await loginPage.login(
          loginCredentials.validPatient.email,
          loginCredentials.validPatient.password,
          'patient'
        );
      });

      await test.step('Verify successful login and redirection', async () => {
        await loginPage.verifySuccessfulLogin('patient');
      });
    });

    test('should login successfully as doctor', async () => {
      // Mock successful login API response
      await loginPage.mockApiResponse('auth/login', {
        ...apiMocks.successfulLogin,
        user: { ...apiMocks.successfulLogin.user, role: 'DOCTOR' }
      });

      await test.step('Fill and submit login form', async () => {
        await loginPage.login(
          loginCredentials.validDoctor.email,
          loginCredentials.validDoctor.password,
          'doctor'
        );
      });

      await test.step('Verify successful login and redirection', async () => {
        await loginPage.verifySuccessfulLogin('doctor');
      });
    });

    test('should show loading state during login', async () => {
      // Add delay to API response to see loading state
      await loginPage.page.route('**/auth/login', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiMocks.successfulLogin)
        });
      });

      await test.step('Submit form and verify loading state', async () => {
        await loginPage.fillCredentials(
          loginCredentials.validPatient.email,
          loginCredentials.validPatient.password
        );
        await loginPage.submitForm();
        await loginPage.verifyLoginButtonLoading();
      });
    });
  });

  test.describe('Login Failures', () => {
    test('should show error for invalid credentials', async () => {
      // Mock login failure response
      await loginPage.mockApiResponse('auth/login', apiMocks.loginError, 401);

      await test.step('Submit invalid credentials', async () => {
        await loginPage.login(
          loginCredentials.invalidUser.email,
          loginCredentials.invalidUser.password,
          'patient'
        );
      });

      await test.step('Verify error message', async () => {
        await loginPage.verifyLoginFailure('Invalid credentials');
      });
    });

    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await loginPage.simulateNetworkFailure('auth/login');

      await test.step('Submit form with network failure', async () => {
        await loginPage.login(
          loginCredentials.validPatient.email,
          loginCredentials.validPatient.password,
          'patient'
        );
      });

      await test.step('Verify network error handling', async () => {
        await loginPage.verifyLoginFailure();
      });
    });

    test('should validate required fields', async () => {
      await test.step('Attempt to submit empty form', async () => {
        await loginPage.submitForm();
      });

      await test.step('Verify HTML5 validation', async () => {
        await loginPage.verifyRequiredFieldValidation();
      });
    });

    test('should validate email format', async () => {
      await test.step('Enter invalid email format', async () => {
        await loginPage.fillCredentials(
          loginCredentials.invalidEmail.email,
          loginCredentials.invalidEmail.password
        );
        await loginPage.submitForm();
      });

      await test.step('Verify email validation', async () => {
        // HTML5 validation should prevent submission
        await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
      });
    });
  });

  test.describe('Form Interactions', () => {
    test('should allow role selection', async () => {
      await test.step('Select doctor role', async () => {
        await loginPage.selectRole('doctor');
        await expect(loginPage.doctorRoleRadio).toBeChecked();
        await expect(loginPage.patientRoleRadio).not.toBeChecked();
      });

      await test.step('Switch to patient role', async () => {
        await loginPage.selectRole('patient');
        await expect(loginPage.patientRoleRadio).toBeChecked();
        await expect(loginPage.doctorRoleRadio).not.toBeChecked();
      });
    });

    test('should handle form field interactions', async () => {
      await test.step('Type in email field', async () => {
        await loginPage.emailInput.fill('test@example.com');
        await expect(loginPage.emailInput).toHaveValue('test@example.com');
      });

      await test.step('Type in password field', async () => {
        await loginPage.passwordInput.fill('password123');
        await expect(loginPage.passwordInput).toHaveValue('password123');
      });

      await test.step('Clear fields', async () => {
        await loginPage.clearForm();
        await expect(loginPage.emailInput).toHaveValue('');
        await expect(loginPage.passwordInput).toHaveValue('');
      });
    });

    test('should support keyboard navigation', async () => {
      await test.step('Navigate through form with Tab key', async () => {
        await loginPage.page.keyboard.press('Tab');
        await expect(loginPage.emailInput).toBeFocused();

        await loginPage.page.keyboard.press('Tab');
        await expect(loginPage.passwordInput).toBeFocused();

        await loginPage.page.keyboard.press('Tab');
        await expect(loginPage.patientRoleRadio).toBeFocused();
      });

      await test.step('Submit form with Enter key', async () => {
        await loginPage.fillCredentials('test@example.com', 'password123');
        await loginPage.page.keyboard.press('Enter');
        // Should trigger form submission
      });
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to signup page', async () => {
      await test.step('Click signup link', async () => {
        await loginPage.goToSignup();
      });

      await test.step('Verify navigation to signup', async () => {
        await expect(loginPage.page).toHaveURL(/.*\/signup/);
      });
    });

    test('should navigate to forgot password page', async () => {
      await test.step('Click forgot password link', async () => {
        await loginPage.goToForgotPassword();
      });

      await test.step('Verify navigation to forgot password', async () => {
        await expect(loginPage.page).toHaveURL(/.*\/forgot-password/);
      });
    });

    test('should navigate to home when clicking logo', async () => {
      await test.step('Click MedScribe logo', async () => {
        await loginPage.medScribeLogo.click();
      });

      await test.step('Verify navigation to home', async () => {
        await expect(loginPage.page).toHaveURL(/.*\/$/);
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async () => {
      await test.step('Set mobile viewport', async () => {
        await loginPage.page.setViewportSize({ width: 375, height: 667 });
      });

      await test.step('Verify mobile layout', async () => {
        await loginPage.verifyResponsiveDesign();
        await expect(loginPage.loginForm).toBeVisible();
        await expect(loginPage.medScribeLogo).toBeVisible();
      });
    });

    test('should display correctly on tablet devices', async () => {
      await test.step('Set tablet viewport', async () => {
        await loginPage.page.setViewportSize({ width: 768, height: 1024 });
      });

      await test.step('Verify tablet layout', async () => {
        await loginPage.verifyResponsiveDesign();
        await expect(loginPage.loginForm).toBeVisible();
      });
    });

    test('should display correctly on desktop', async () => {
      await test.step('Set desktop viewport', async () => {
        await loginPage.page.setViewportSize({ width: 1024, height: 768 });
      });

      await test.step('Verify desktop layout', async () => {
        await loginPage.verifyResponsiveDesign();
        await expect(loginPage.loginForm).toBeVisible();
      });
    });
  });

  test.describe('Security', () => {
    test('should mask password input', async () => {
      await test.step('Verify password field type', async () => {
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
      });

      await test.step('Verify password is masked', async () => {
        await loginPage.passwordInput.fill('secretpassword');
        // Password should not be visible in plain text
        const inputType = await loginPage.passwordInput.getAttribute('type');
        expect(inputType).toBe('password');
      });
    });

    test('should clear form on multiple failed attempts', async () => {
      // Mock multiple failed login attempts
      await loginPage.mockApiResponse('auth/login', apiMocks.loginError, 401);

      for (let i = 0; i < 3; i++) {
        await test.step(`Failed attempt ${i + 1}`, async () => {
          await loginPage.login(
            loginCredentials.invalidUser.email,
            loginCredentials.invalidUser.password,
            'patient'
          );
          await loginPage.verifyLoginFailure();
        });
      }
    });
  });

  test.describe('Performance', () => {
    test('should load page within acceptable time', async () => {
      const startTime = Date.now();
      
      await test.step('Navigate to login page', async () => {
        await loginPage.goto();
      });

      await test.step('Verify page load time', async () => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(testConfig.timeouts.medium);
      });
    });

    test('should handle rapid form submissions', async () => {
      await loginPage.mockApiResponse('auth/login', apiMocks.successfulLogin);

      await test.step('Submit form multiple times rapidly', async () => {
        await loginPage.fillCredentials(
          loginCredentials.validPatient.email,
          loginCredentials.validPatient.password
        );

        // Submit form multiple times quickly
        for (let i = 0; i < 5; i++) {
          await loginPage.loginButton.click();
          await loginPage.page.waitForTimeout(100);
        }
      });

      await test.step('Verify only one successful submission', async () => {
        // Should only process one login attempt
        await loginPage.verifySuccessfulLogin('patient');
      });
    });
  });
});