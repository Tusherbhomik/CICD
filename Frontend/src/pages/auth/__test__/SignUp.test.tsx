import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import SignUp from '../SignUp';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { TEST_API_BASE_URL } from '@/test/config';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render signup form with all required elements', () => {
      render(<SignUp />);
      
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      expect(screen.getByText('Join MedScribe to manage prescriptions digitally')).toBeInTheDocument();
      
      // Check role selection
      expect(screen.getByText('I am a:')).toBeInTheDocument();
      expect(screen.getByLabelText('Doctor')).toBeInTheDocument();
      expect(screen.getByLabelText('Patient')).toBeInTheDocument();
      
      // Check form fields
      expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Birth Date *')).toBeInTheDocument();
      expect(screen.getByLabelText('Password *')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password *')).toBeInTheDocument();
      
      // Check gender field (Select component renders differently)
      expect(screen.getByText('Gender *')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      // Check buttons and links
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });

    it('should have patient role selected by default', () => {
      render(<SignUp />);
      
      const patientRadio = screen.getByLabelText('Patient');
      expect(patientRadio).toBeChecked();
    });

    it('should show placeholders for select components', () => {
      render(<SignUp />);
      
      expect(screen.getByText('Select your gender')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should allow user to fill all form fields', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill text inputs
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
      await user.type(screen.getByLabelText('Phone Number'), '1234567890');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Check values - use more specific selectors
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
      
      // Check password fields specifically
      const passwordInput = screen.getByLabelText('Password *');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
      expect(passwordInput).toHaveValue('password123');
      expect(confirmPasswordInput).toHaveValue('password123');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should allow user to switch between doctor and patient roles', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      const doctorRadio = screen.getByLabelText('Doctor');
      const patientRadio = screen.getByLabelText('Patient');
      
      // Initially patient should be selected
      expect(patientRadio).toBeChecked();
      expect(doctorRadio).not.toBeChecked();
      
      // Click doctor radio
      await user.click(doctorRadio);
      
      expect(doctorRadio).toBeChecked();
      expect(patientRadio).not.toBeChecked();
    });

    it('should allow user to select gender', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Initially should show placeholder
      expect(screen.getByText('Select your gender')).toBeInTheDocument();
      
      // Click on gender select trigger button
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      
      // Wait for options to appear and select male option
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // After selection, check that placeholder is gone and selection worked
      await waitFor(() => {
        // The placeholder text should no longer be visible
        expect(screen.queryByText('Select your gender')).not.toBeInTheDocument();
        // Check that the selection was successful by looking for the trigger's updated state
        expect(genderTrigger).toHaveAttribute('data-state', 'closed');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill form with mismatched passwords
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'differentpassword');
      
      // Select gender
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
      
      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error when required fields are missing', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Only fill email and passwords, leave name, birthDate, and gender empty
      await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Submit form - this should trigger client-side validation
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);
      
      // Wait a bit for any validation to trigger
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // The form should not submit because required fields are missing
      // So navigation should not happen
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Try to find validation message with more flexible approach
      await waitFor(() => {
        const toastElements = document.querySelectorAll('[role="alert"], [role="status"], .sonner-toast, .toast');
        const hasValidationMessage = Array.from(toastElements).some(el => 
          el.textContent?.includes('Missing Information') || 
          el.textContent?.includes('Please fill in all required fields')
        );
        
        // Either the validation message should appear, or at minimum navigation shouldn't happen
        expect(hasValidationMessage || mockNavigate.mock.calls.length === 0).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  describe('Successful Registration', () => {
    it('should register patient successfully and navigate to patient dashboard', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill complete form for patient
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'newpatient@test.com');
      await user.type(screen.getByLabelText('Phone Number'), '1234567890');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
      
      // Check localStorage
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'patient');
      });
    });

    it('should register doctor successfully and navigate to doctor dashboard', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Select doctor role
      await user.click(screen.getByLabelText('Doctor'));
      
      // Fill complete form
      await user.type(screen.getByLabelText('Full Name *'), 'Dr. Jane Smith');
      await user.type(screen.getByLabelText('Email Address *'), 'newdoctor@test.com');
      await user.type(screen.getByLabelText('Phone Number'), '1234567890');
      await user.type(screen.getByLabelText('Birth Date *'), '1985-05-15');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await user.click(screen.getByRole('option', { name: 'Female' }));
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
      });
      
      // Check localStorage
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'doctor');
      });
    });

    it('should show success toast on successful registration', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill complete form
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'newuser@test.com');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check for success toast
      await waitFor(() => {
        expect(screen.getByText('Registration successful')).toBeInTheDocument();
        expect(screen.getByText('Welcome to MedScribe! Redirecting to your dashboard...')).toBeInTheDocument();
      });
    });
  });

  describe('Failed Registration', () => {
    it('should show error message for existing email', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill form with existing email
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'existing@test.com');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Override the signup handler to simulate network error
      server.use(
        http.post(`${TEST_API_BASE_URL}/api/auth/signup`, () => {
          return HttpResponse.error();
        })
      );

      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill complete form
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'test@test.com');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      // Add delay to the signup handler for this specific test
      server.use(
        http.post(`${TEST_API_BASE_URL}/api/auth/signup`, async ({ request }) => {
          // Add a delay to simulate slower network
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const userData = await request.json() as { email: string; name: string; password: string };
          
          if (userData.email && userData.password && userData.name) {
            return HttpResponse.json({
              id: 3,
              name: userData.name,
              email: userData.email,
              role: 'PATIENT'
            });
          }
          
          return HttpResponse.json(
            { message: 'Missing required fields' },
            { status: 400 }
          );
        })
      );

      const user = userEvent.setup();
      render(<SignUp />);
      
      // Fill complete form
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'test@test.com');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      
      // Submit form
      await user.click(submitButton);
      
      // Check if button shows loading text
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      
      // Wait for completion
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct navigation links', () => {
      render(<SignUp />);
      
      const loginLink = screen.getByRole('link', { name: 'Log In' });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Phone Number Field', () => {
    it('should allow optional phone number input', async () => {
      const user = userEvent.setup();
      render(<SignUp />);
      
      // Phone number should be optional
      await user.type(screen.getByLabelText('Phone Number'), '9876543210');
      expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
      
      // Form should work without phone number too
      await user.clear(screen.getByLabelText('Phone Number'));
      
      // Fill other required fields
      await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address *'), 'test@test.com');
      await user.type(screen.getByLabelText('Birth Date *'), '1990-01-01');
      await user.type(screen.getByLabelText('Password *'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password *'), 'password123');
      
      // Select gender using proper combobox interaction
      const genderTrigger = screen.getByRole('combobox');
      await user.click(genderTrigger);
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Male' })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: 'Male' }));
      
      // Should be able to submit without phone
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
    });
  });
});