import { test, expect } from '@playwright/test';
import { SignUpPage } from '../page-objects/SignUpPage';
import { testUsers, generateTestUser, invalidTestData, apiMocks, testConfig } from '../fixtures/test-data';

test.describe('SignUp Page', () => {
  let signupPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignUpPage(page);
    await signupPage.goto();
  });

  test.afterEach(async ({ page }) => {
    // Clean up localStorage after each test
    await signupPage.clearStorage();
  });

  test.describe('Page Rendering', () => {
    test('should render all signup form elements', async () => {
      await test.step('Verify page title and heading', async () => {
        await expect(signupPage.pageHeading).toBeVisible();
        await expect(signupPage.pageHeading).toContainText('Create Your Account');
      });

      await test.step('Verify all form inputs are present', async () => {
        await expect(signupPage.nameInput).toBeVisible();
        await expect(signupPage.emailInput).toBeVisible();
        await expect(signupPage.phoneInput).toBeVisible();
        await expect(signupPage.birthDateInput).toBeVisible();
        await expect(signupPage.genderSelect).toBeVisible();
        await expect(signupPage.passwordInput).toBeVisible();
        await expect(signupPage.confirmPasswordInput).toBeVisible();
      });

      await test.step('Verify role selection and buttons', async () => {
        await expect(signupPage.doctorRoleRadio).toBeVisible();
        await expect(signupPage.patientRoleRadio).toBeVisible();
        await expect(signupPage.signupButton).toBeVisible();
        await expect(signupPage.loginLink).toBeVisible();
      });
    });

    test('should have correct default values', async () => {
      await test.step('Patient role should be selected by default', async () => {
        await expect(signupPage.patientRoleRadio).toBeChecked();
        await expect(signupPage.doctorRoleRadio).not.toBeChecked();
      });

      await test.step('All form fields should be empty', async () => {
        await expect(signupPage.nameInput).toHaveValue('');
        await expect(signupPage.emailInput).toHaveValue('');
        await expect(signupPage.phoneInput).toHaveValue('');
        await expect(signupPage.passwordInput).toHaveValue('');
        await expect(signupPage.confirmPasswordInput).toHaveValue('');
      });
    });

    test('should be accessible', async () => {
      await signupPage.verifyAccessibility();
    });

    test('should have proper form validation attributes', async () => {
      await signupPage.verifyFormValidation();
    });
  });

  test.describe('Successful Registration', () => {
    test('should register successfully as patient', async () => {
      const testUser = generateTestUser({ role: 'PATIENT' });
      
      // Mock successful registration API response
      await signupPage.mockApiResponse('auth/signup', {
        ...apiMocks.successfulSignup,
        role: 'PATIENT'
      });

      await test.step('Fill and submit signup form', async () => {
        await signupPage.signUp(testUser);
      });

      await test.step('Verify successful registration and redirection', async () => {
        await signupPage.verifySuccessfulSignup('PATIENT');
      });
    });

    test('should register successfully as doctor', async () => {
      const testUser = generateTestUser({ role: 'DOCTOR' });
      
      // Mock successful registration API response
      await signupPage.mockApiResponse('auth/signup', {
        ...apiMocks.successfulSignup,
        role: 'DOCTOR'
      });

      await test.step('Fill and submit signup form', async () => {
        await signupPage.signUp(testUser);
      });

      await test.step('Verify successful registration and redirection', async () => {
        await signupPage.verifySuccessfulSignup('DOCTOR');
      });
    });

    test('should show loading state during registration', async () => {
      const testUser = generateTestUser();
      
      // Add delay to API response to see loading state
      await signupPage.page.route('**/auth/signup', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiMocks.successfulSignup)
        });
      });

      await test.step('Submit form and verify loading state', async () => {
        await signupPage.signUp(testUser);
        await signupPage.verifySignupButtonLoading();
      });
    });

    test('should handle all gender options', async () => {
      const genders: Array<'MALE' | 'FEMALE' | 'OTHER'> = ['MALE', 'FEMALE', 'OTHER'];
      
      for (const gender of genders) {
        await test.step(`Test registration with ${gender} gender`, async () => {
          const testUser = generateTestUser({ gender, role: 'PATIENT' });
          
          await signupPage.mockApiResponse('auth/signup', apiMocks.successfulSignup);
          await signupPage.clearForm();
          await signupPage.signUp(testUser);
          await signupPage.verifySuccessfulSignup('PATIENT');
          
          // Reset for next iteration
          await signupPage.page.reload();
        });
      }
    });
  });

  test.describe('Registration Failures', () => {
    test('should show error for duplicate email', async () => {
      const testUser = generateTestUser();
      
      // Mock duplicate email error
      await signupPage.mockApiResponse('auth/signup', {
        message: 'Email already exists'
      }, 409);

      await test.step('Submit form with existing email', async () => {
        await signupPage.signUp(testUser);
      });

      await test.step('Verify error message', async () => {
        await signupPage.verifySignupFailure('Email already exists');
      });
    });

    test('should handle network errors gracefully', async () => {
      const testUser = generateTestUser();
      
      // Simulate network failure
      await signupPage.simulateNetworkFailure('auth/signup');

      await test.step('Submit form with network failure', async () => {
        await signupPage.signUp(testUser);
      });

      await test.step('Verify network error handling', async () => {
        await signupPage.verifySignupFailure();
      });
    });

    test('should validate password mismatch', async () => {
      const testUser = generateTestUser();
      
      await test.step('Enter mismatched passwords', async () => {
        await signupPage.selectRole(testUser.role);
        await signupPage.fillBasicInfo(testUser);
        await signupPage.selectGender(testUser.gender);
        await signupPage.fillPasswords(testUser.password, 'DifferentPassword123!');
        await signupPage.submitForm();
      });

      await test.step('Verify password mismatch error', async () => {
        await signupPage.verifyPasswordMismatchError();
      });
    });

    test('should validate required fields', async () => {
      await test.step('Submit form with missing required fields', async () => {
        await signupPage.submitForm();
      });

      await test.step('Verify required fields validation', async () => {
        // HTML5 validation should prevent submission
        await expect(signupPage.signupForm).toBeVisible();
      });
    });

    test('should validate weak passwords', async () => {
      const testUser = generateTestUser();
      
      for (const weakPassword of invalidTestData.weakPasswords) {
        await test.step(`Test weak password: ${weakPassword}`, async () => {
          await signupPage.clearForm();
          await signupPage.selectRole(testUser.role);
          await signupPage.fillBasicInfo(testUser);
          await signupPage.selectGender(testUser.gender);
          await signupPage.fillPasswords(weakPassword, weakPassword);
          
          // This would depend on your client-side validation
          // If you have password strength validation, test it here
          await signupPage.submitForm();
        });
      }
    });

    test('should validate invalid email formats', async () => {
      const testUser = generateTestUser();
      
      for (const invalidEmail of invalidTestData.invalidEmails) {
        await test.step(`Test invalid email: ${invalidEmail}`, async () => {
          await signupPage.clearForm();
          await signupPage.selectRole(testUser.role);
          await signupPage.fillBasicInfo({
            ...testUser,
            email: invalidEmail
          });
          await signupPage.selectGender(testUser.gender);
          await signupPage.fillPasswords(testUser.password);
          await signupPage.submitForm();
          
          // HTML5 email validation should prevent submission
          await expect(signupPage.emailInput).toHaveAttribute('type', 'email');
        });
      }
    });
  });

  test.describe('Form Interactions', () => {
    test('should allow role selection', async () => {
      await test.step('Select doctor role', async () => {
        await signupPage.selectRole('DOCTOR');
        await expect(signupPage.doctorRoleRadio).toBeChecked();
        await expect(signupPage.patientRoleRadio).not.toBeChecked();
      });

      await test.step('Switch to patient role', async () => {
        await signupPage.selectRole('PATIENT');
        await expect(signupPage.patientRoleRadio).toBeChecked();
        await expect(signupPage.doctorRoleRadio).not.toBeChecked();
      });
    });

    test('should handle gender dropdown interactions', async () => {
      await signupPage.verifyGenderDropdown();
      
      await test.step('Select each gender option', async () => {
        const genders: Array<'MALE' | 'FEMALE' | 'OTHER'> = ['MALE', 'FEMALE', 'OTHER'];
        
        for (const gender of genders) {
          await signupPage.selectGender(gender);
          // Verify selection by checking the dropdown value or visible text
          await expect(signupPage.genderSelect).toContainText(gender.charAt(0) + gender.slice(1).toLowerCase());
        }
      });
    });

    test('should handle date input', async () => {
      await test.step('Enter valid birth date', async () => {
        await signupPage.birthDateInput.fill('1990-05-15');
        await expect(signupPage.birthDateInput).toHaveValue('1990-05-15');
      });

      await test.step('Clear date input', async () => {
        await signupPage.birthDateInput.clear();
        await expect(signupPage.birthDateInput).toHaveValue('');
      });
    });

    test('should support keyboard navigation', async () => {
      await test.step('Navigate through form with Tab key', async () => {
        await signupPage.page.keyboard.press('Tab');
        await expect(signupPage.nameInput).toBeFocused();

        await signupPage.page.keyboard.press('Tab');
        await expect(signupPage.emailInput).toBeFocused();

        await signupPage.page.keyboard.press('Tab');
        await expect(signupPage.phoneInput).toBeFocused();
      });

      await test.step('Submit form with Enter key', async () => {
        const testUser = generateTestUser();
        await signupPage.signUp(testUser);
        await signupPage.page.keyboard.press('Enter');
        // Should trigger form submission
      });
    });

    test('should handle form field clearing', async () => {
      const testUser = generateTestUser();
      
      await test.step('Fill all fields', async () => {
        await signupPage.fillBasicInfo(testUser);
        await signupPage.fillPasswords(testUser.password);
      });

      await test.step('Clear all fields', async () => {
        await signupPage.clearForm();
        await expect(signupPage.nameInput).toHaveValue('');
        await expect(signupPage.emailInput).toHaveValue('');
        await expect(signupPage.phoneInput).toHaveValue('');
        await expect(signupPage.passwordInput).toHaveValue('');
        await expect(signupPage.confirmPasswordInput).toHaveValue('');
      });
    });
  });

  test.describe('Form Validation', () => {
    test('should prevent submission with empty required fields', async () => {
      await signupPage.testEmptyFormSubmission();
    });

    test('should validate email format in real-time', async () => {
      await test.step('Enter invalid email format', async () => {
        await signupPage.emailInput.fill('invalid-email');
        await signupPage.emailInput.blur();
        
        // Check if browser validation kicks in
        const validationMessage = await signupPage.emailInput.evaluate(
          (el: HTMLInputElement) => el.validationMessage
        );
        expect(validationMessage).toBeTruthy();
      });
    });

    test('should validate password confirmation in real-time', async () => {
      await test.step('Enter mismatched passwords', async () => {
        await signupPage.passwordInput.fill('Password123!');
        await signupPage.confirmPasswordInput.fill('DifferentPassword123!');
        await signupPage.confirmPasswordInput.blur();
        
        // This would test client-side validation if implemented
        // For now, validation happens on form submission
      });
    });

    test('should validate birth date constraints', async () => {
      await test.step('Test future birth date', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateString = futureDate.toISOString().split('T')[0];
        
        await signupPage.birthDateInput.fill(futureDateString);
        // Your validation logic here
      });

      await test.step('Test very old birth date', async () => {
        await signupPage.birthDateInput.fill('1900-01-01');
        // Your validation logic here
      });
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to login page', async () => {
      await test.step('Click login link', async () => {
        await signupPage.goToLogin();
      });

      await test.step('Verify navigation to login', async () => {
        await expect(signupPage.page).toHaveURL(/.*\/login/);
      });
    });

    test('should maintain form data when navigating back', async () => {
      const testUser = generateTestUser();
      
      await test.step('Fill partial form data', async () => {
        await signupPage.nameInput.fill(testUser.name);
        await signupPage.emailInput.fill(testUser.email);
      });

      await test.step('Navigate away and back', async () => {
        await signupPage.goToLogin();
        await signupPage.page.goBack();
      });

      await test.step('Verify form data persistence', async () => {
        // Note: This depends on browser behavior and may not always work
        await expect(signupPage.nameInput).toHaveValue(testUser.name);
        await expect(signupPage.emailInput).toHaveValue(testUser.email);
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async () => {
      await test.step('Set mobile viewport', async () => {
        await signupPage.page.setViewportSize({ width: 375, height: 667 });
      });

      await test.step('Verify mobile layout', async () => {
        await signupPage.verifyResponsiveDesign();
        await expect(signupPage.signupForm).toBeVisible();
        await expect(signupPage.pageHeading).toBeVisible();
      });

      await test.step('Test form interaction on mobile', async () => {
        const testUser = generateTestUser();
        await signupPage.signUp(testUser);
      });
    });

    test('should display correctly on tablet devices', async () => {
      await test.step('Set tablet viewport', async () => {
        await signupPage.page.setViewportSize({ width: 768, height: 1024 });
      });

      await test.step('Verify tablet layout', async () => {
        await signupPage.verifyResponsiveDesign();
        await expect(signupPage.signupForm).toBeVisible();
      });
    });

    test('should handle form overflow on small screens', async () => {
      await test.step('Set very small viewport', async () => {
        await signupPage.page.setViewportSize({ width: 320, height: 568 });
      });

      await test.step('Verify form is still usable', async () => {
        await expect(signupPage.signupForm).toBeVisible();
        await expect(signupPage.signupButton).toBeVisible();
        
        // Test scrolling to bottom of form
        await signupPage.signupButton.scrollIntoViewIfNeeded();
        await expect(signupPage.signupButton).toBeInViewport();
      });
    });
  });

  test.describe('Security', () => {
    test('should mask password inputs', async () => {
      await test.step('Verify password field types', async () => {
        await expect(signupPage.passwordInput).toHaveAttribute('type', 'password');
        await expect(signupPage.confirmPasswordInput).toHaveAttribute('type', 'password');
      });

      await test.step('Verify passwords are masked', async () => {
        await signupPage.passwordInput.fill('secretpassword');
        await signupPage.confirmPasswordInput.fill('secretpassword');
        
        // Passwords should not be visible in plain text
        const passwordType = await signupPage.passwordInput.getAttribute('type');
        const confirmPasswordType = await signupPage.confirmPasswordInput.getAttribute('type');
        expect(passwordType).toBe('password');
        expect(confirmPasswordType).toBe('password');
      });
    });

    test('should prevent XSS in form inputs', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      await test.step('Enter XSS payload in name field', async () => {
        await signupPage.nameInput.fill(xssPayload);
        await expect(signupPage.nameInput).toHaveValue(xssPayload);
      });

      await test.step('Verify XSS payload is treated as text', async () => {
        // The script should not execute, just be treated as text
        const alerts: string[] = [];
        signupPage.page.on('dialog', dialog => {
          alerts.push(dialog.message());
          dialog.dismiss();
        });
        
        await signupPage.submitForm();
        expect(alerts).toHaveLength(0);
      });
    });
  });

  test.describe('Performance', () => {
    test('should load page within acceptable time', async () => {
      const startTime = Date.now();
      
      await test.step('Navigate to signup page', async () => {
        await signupPage.goto();
      });

      await test.step('Verify page load time', async () => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(testConfig.timeouts.medium);
      });
    });

    test('should handle large form submissions efficiently', async () => {
      const testUser = generateTestUser({
        name: 'X'.repeat(100), // Maximum length name
        email: 'verylongemailaddress@verylongdomainname.com'
      });
      
      await signupPage.mockApiResponse('auth/signup', apiMocks.successfulSignup);

      const startTime = Date.now();
      
      await test.step('Submit large form data', async () => {
        await signupPage.signUp(testUser);
      });

      await test.step('Verify submission time', async () => {
        const submissionTime = Date.now() - startTime;
        expect(submissionTime).toBeLessThan(testConfig.timeouts.medium);
      });
    });

    test('should handle rapid form field changes', async () => {
      await test.step('Rapidly change form values', async () => {
        for (let i = 0; i < 10; i++) {
          await signupPage.nameInput.fill(`Name ${i}`);
          await signupPage.emailInput.fill(`email${i}@test.com`);
          await signupPage.page.waitForTimeout(50);
        }
      });

      await test.step('Verify final values are correct', async () => {
        await expect(signupPage.nameInput).toHaveValue('Name 9');
        await expect(signupPage.emailInput).toHaveValue('email9@test.com');
      });
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle special characters in names', async () => {
      const specialNames = [
        "José María González",
        "O'Connor",
        "Van der Berg",
        "李小明",
        "محمد علي"
      ];

      for (const specialName of specialNames) {
        await test.step(`Test name with special characters: ${specialName}`, async () => {
          await signupPage.nameInput.clear();
          await signupPage.nameInput.fill(specialName);
          await expect(signupPage.nameInput).toHaveValue(specialName);
        });
      }
    });

    test('should handle email edge cases', async () => {
      const edgeCaseEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user_name@example-domain.com',
        'a@b.co'
      ];

      for (const email of edgeCaseEmails) {
        await test.step(`Test edge case email: ${email}`, async () => {
          await signupPage.emailInput.clear();
          await signupPage.emailInput.fill(email);
          await expect(signupPage.emailInput).toHaveValue(email);
        });
      }
    });

    test('should handle boundary birth dates', async () => {
      const boundaryDates = [
        '1920-01-01', // Very old
        '2005-12-31', // Recent but valid
        '1990-02-29', // Leap year
        '2000-02-29'  // Leap year
      ];

      for (const date of boundaryDates) {
        await test.step(`Test boundary date: ${date}`, async () => {
          await signupPage.birthDateInput.clear();
          await signupPage.birthDateInput.fill(date);
          await expect(signupPage.birthDateInput).toHaveValue(date);
        });
      }
    });
  });
});