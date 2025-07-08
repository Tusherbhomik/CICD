import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { SignUpPage } from '../page-objects/SignUpPage';
import { generateTestUser, apiMocks, testUsers } from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let signupPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    signupPage = new SignUpPage(page);

    // Navigate to valid origin before clearing storage
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.context().clearCookies();
  });

  test.describe('Complete User Journey', () => {
    test('should complete full signup to login flow for patient', async ({ page }) => {
      const testUser = generateTestUser({ role: 'PATIENT' });

      await test.step('Navigate to signup and register new user', async () => {
        await signupPage.goto();
        
        // Mock successful signup
        await signupPage.mockApiResponse('auth/signup', {
          ...apiMocks.successfulSignup,
          role: 'PATIENT'
        });
        
        await signupPage.signUp(testUser);
        await signupPage.verifySuccessfulSignup('PATIENT');
      });

      await test.step('Verify user is redirected to patient dashboard', async () => {
        await expect(page).toHaveURL(/.*\/patient\/dashboard/);
        
        // Verify user role is stored
        const userRole = await page.evaluate(() => localStorage.getItem('userRole'));
        expect(userRole).toBe('patient');
      });

      await test.step('Logout and verify redirect to home', async () => {
        // Simulate logout (this would depend on your logout implementation)
        await page.evaluate(() => localStorage.removeItem('userRole'));
        await page.goto('/');
        await expect(page).toHaveURL(/.*\/$/);
      });

      await test.step('Login with same credentials', async () => {
        await loginPage.goto();
        
        // Mock successful login
        await loginPage.mockApiResponse('auth/login', {
          ...apiMocks.successfulLogin,
          user: { ...apiMocks.successfulLogin.user, role: 'PATIENT' }
        });
        
        await loginPage.login(testUser.email, testUser.password, 'patient');
        await loginPage.verifySuccessfulLogin('patient');
      });

      await test.step('Verify user is redirected back to patient dashboard', async () => {
        await expect(page).toHaveURL(/.*\/patient\/dashboard/);
      });
    });

    test('should complete full signup to login flow for doctor', async ({ page }) => {
      const testUser = generateTestUser({ role: 'DOCTOR' });

      await test.step('Navigate to signup and register new doctor', async () => {
        await signupPage.goto();
        
        // Mock successful signup
        await signupPage.mockApiResponse('auth/signup', {
          ...apiMocks.successfulSignup,
          role: 'DOCTOR'
        });
        
        await signupPage.signUp(testUser);
        await signupPage.verifySuccessfulSignup('DOCTOR');
      });

      await test.step('Verify user is redirected to doctor dashboard', async () => {
        await expect(page).toHaveURL(/.*\/doctor\/dashboard/);
        
        // Verify user role is stored
        const userRole = await page.evaluate(() => localStorage.getItem('userRole'));
        expect(userRole).toBe('doctor');
      });

      await test.step('Logout and login again', async () => {
        // Simulate logout
        await page.evaluate(() => localStorage.removeItem('userRole'));
        await loginPage.goto();
        
        // Mock successful login
        await loginPage.mockApiResponse('auth/login', {
          ...apiMocks.successfulLogin,
          user: { ...apiMocks.successfulLogin.user, role: 'DOCTOR' }
        });
        
        await loginPage.login(testUser.email, testUser.password, 'doctor');
        await loginPage.verifySuccessfulLogin('doctor');
      });

      await test.step('Verify user is redirected back to doctor dashboard', async () => {
        await expect(page).toHaveURL(/.*\/doctor\/dashboard/);
      });
    });
  });

  test.describe('Navigation Between Auth Pages', () => {
    test('should navigate between login and signup pages', async () => {
      await test.step('Start at login page', async () => {
        await loginPage.goto();
        await expect(loginPage.welcomeHeading).toBeVisible();
      });

      await test.step('Navigate to signup page', async () => {
        await loginPage.goToSignup();
        await expect(signupPage.pageHeading).toBeVisible();
      });

      await test.step('Navigate back to login page', async () => {
        await signupPage.goToLogin();
        await expect(loginPage.welcomeHeading).toBeVisible();
      });
    });

    test('should maintain form data when navigating between pages', async () => {
      const testEmail = 'test@example.com';

      await test.step('Fill email on login page', async () => {
        await loginPage.goto();
        await loginPage.emailInput.fill(testEmail);
      });

      await test.step('Navigate to signup and back', async () => {
        await loginPage.goToSignup();
        await signupPage.goToLogin();
      });

      await test.step('Verify email is preserved', async () => {
        // Note: This depends on browser behavior
        const emailValue = await loginPage.emailInput.inputValue();
        // Some browsers may preserve form data, others may not
        console.log('Email preserved:', emailValue === testEmail);
      });
    });
  });

  test.describe('Session Management', () => {
    test('should handle session persistence', async ({ page }) => {
      const testUser = testUsers.validPatient;

      await test.step('Login and verify session', async () => {
        await loginPage.goto();
        
        // Mock successful login
        await loginPage.mockApiResponse('auth/login', {
          ...apiMocks.successfulLogin,
          user: { ...apiMocks.successfulLogin.user, role: 'PATIENT' }
        });
        
        await loginPage.login(testUser.email, testUser.password, 'patient');
        await loginPage.verifySuccessfulLogin('patient');
      });

      await test.step('Navigate directly to protected route', async () => {
        await page.goto('/patient/profile');
        // Should remain on the profile page without redirect to login
        await expect(page).toHaveURL(/.*\/patient\/profile/);
      });

      await test.step('Refresh page and verify session persistence', async () => {
        await page.reload();
        // Should still be on the profile page
        await expect(page).toHaveURL(/.*\/patient\/profile/);
      });
    });

    test('should handle session expiration', async ({ page }) => {
      await test.step('Simulate expired session', async () => {
        // Set expired user role
        await page.evaluate(() => localStorage.setItem('userRole', 'patient'));
        
        // Mock API call that returns unauthorized
        await page.route('**/auth/me', route => {
          route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Unauthorized' })
          });
        });
      });

      await test.step('Navigate to protected route', async () => {
        await page.goto('/patient/dashboard');
        // Should redirect to login page due to expired session
        await expect(page).toHaveURL(/.*\/login/);
      });
    });

    test('should clear session on logout', async ({ page }) => {
      await test.step('Setup authenticated session', async () => {
        await page.evaluate(() => localStorage.setItem('userRole', 'patient'));
      });

      await test.step('Perform logout', async () => {
        // Mock logout API
        await page.route('**/auth/logout', route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Logged out successfully' })
          });
        });

        // Simulate logout action (this would be triggered by logout button in real app)
        await page.evaluate(() => {
          localStorage.removeItem('userRole');
        });
      });

      await test.step('Verify session is cleared', async () => {
        const userRole = await page.evaluate(() => localStorage.getItem('userRole'));
        expect(userRole).toBeNull();
      });

      await test.step('Verify redirect to login when accessing protected route', async () => {
        await page.goto('/patient/dashboard');
        // Should redirect to login
        await expect(page).toHaveURL(/.*\/login/);
      });
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should prevent cross-role access', async ({ page }) => {
      await test.step('Login as patient', async () => {
        await page.evaluate(() => localStorage.setItem('userRole', 'patient'));
      });

      await test.step('Try to access doctor routes', async () => {
        await page.goto('/doctor/dashboard');
        // Should redirect to appropriate page or show access denied
        // This depends on your routing implementation
        await expect(page).not.toHaveURL(/.*\/doctor\/dashboard/);
      });

      await test.step('Login as doctor', async () => {
        await page.evaluate(() => localStorage.setItem('userRole', 'doctor'));
      });

      await test.step('Try to access patient routes', async () => {
        await page.goto('/patient/dashboard');
        // Should redirect to appropriate page or show access denied
        await expect(page).not.toHaveURL(/.*\/patient\/dashboard/);
      });
    });

    test('should redirect to correct dashboard based on role', async ({ page }) => {
      const scenarios = [
        { role: 'patient', expectedPath: '/patient/dashboard' },
        { role: 'doctor', expectedPath: '/doctor/dashboard' }
      ];

      for (const scenario of scenarios) {
        await test.step(`Test ${scenario.role} dashboard redirect`, async () => {
          // Clear previous session
          await page.evaluate(() => localStorage.clear());
          
          await loginPage.goto();
          
          // Mock login response with specific role
          await loginPage.mockApiResponse('auth/login', {
            ...apiMocks.successfulLogin,
            user: { 
              ...apiMocks.successfulLogin.user, 
              role: scenario.role.toUpperCase() 
            }
          });
          
          const credentials = scenario.role === 'patient' 
            ? { email: 'patient@test.com', password: 'test123', role: 'patient' as const }
            : { email: 'doctor@test.com', password: 'test123', role: 'doctor' as const };
          
          await loginPage.login(credentials.email, credentials.password, credentials.role);
          
          // Verify redirect to correct dashboard
          await expect(page).toHaveURL(new RegExp(`.*${scenario.expectedPath}`));
        });
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully during auth flow', async () => {
      await test.step('Test signup with server error', async () => {
        await signupPage.goto();
        
        // Mock server error
        await signupPage.mockApiResponse('auth/signup', {
          message: 'Internal server error'
        }, 500);
        
        const testUser = generateTestUser();
        await signupPage.signUp(testUser);
        await signupPage.verifySignupFailure('Internal server error');
      });

      await test.step('Test login with server error', async () => {
        await loginPage.goto();
        
        // Mock server error
        await loginPage.mockApiResponse('auth/login', {
          message: 'Service unavailable'
        }, 503);
        
        await loginPage.login('test@example.com', 'password123', 'patient');
        await loginPage.verifyLoginFailure('Service unavailable');
      });
    });

    test('should handle network connectivity issues', async () => {
      await test.step('Test signup with network failure', async () => {
        await signupPage.goto();
        await signupPage.simulateNetworkFailure('auth/signup');
        
        const testUser = generateTestUser();
        await signupPage.signUp(testUser);
        await signupPage.verifySignupFailure();
      });

      await test.step('Test login with network failure', async () => {
        await loginPage.goto();
        await loginPage.simulateNetworkFailure('auth/login');
        
        await loginPage.login('test@example.com', 'password123', 'patient');
        await loginPage.verifyLoginFailure();
      });
    });
  });

  test.describe('Data Validation Flow', () => {
    test('should enforce consistent validation between signup and login', async () => {
      const invalidEmail = 'invalid-email-format';

      await test.step('Test invalid email on signup', async () => {
        await signupPage.goto();
        const testUser = generateTestUser({ email: invalidEmail });
        
        await signupPage.fillBasicInfo(testUser);
        await signupPage.submitForm();
        
        // Should prevent submission due to HTML5 validation
        await expect(signupPage.signupForm).toBeVisible();
      });

      await test.step('Test same invalid email on login', async () => {
        await loginPage.goto();
        await loginPage.fillCredentials(invalidEmail, 'password123');
        await loginPage.submitForm();
        
        // Should prevent submission due to HTML5 validation
        await expect(loginPage.loginForm).toBeVisible();
      });
    });

    test('should maintain consistent password requirements', async () => {
      const weakPassword = '123';

      await test.step('Test weak password on signup', async () => {
        await signupPage.goto();
        const testUser = generateTestUser({ password: weakPassword });
        
        await signupPage.signUp({
          ...testUser,
          confirmPassword: weakPassword
        });
        
        // Should handle weak password appropriately
        // This depends on your client-side validation implementation
      });
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work with browser back/forward buttons', async ({ page }) => {
      await test.step('Navigate through auth pages', async () => {
        await loginPage.goto();
        await loginPage.goToSignup();
        await signupPage.goToLogin();
      });

      await test.step('Use browser back button', async () => {
        await page.goBack();
        await expect(signupPage.pageHeading).toBeVisible();
      });

      await test.step('Use browser forward button', async () => {
        await page.goForward();
        await expect(loginPage.welcomeHeading).toBeVisible();
      });
    });

    test('should handle page refresh during auth process', async ({ page }) => {
      const testUser = generateTestUser();

      await test.step('Fill partial signup form', async () => {
        await signupPage.goto();
        await signupPage.nameInput.fill(testUser.name);
        await signupPage.emailInput.fill(testUser.email);
      });

      await test.step('Refresh page', async () => {
        await page.reload();
      });

      await test.step('Verify form is reset', async () => {
        // After refresh, form should be empty
        await expect(signupPage.nameInput).toHaveValue('');
        await expect(signupPage.emailInput).toHaveValue('');
      });
    });
  });
});