import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import Login from '../Login';
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

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render login form with all required elements', () => {
      render(<Login />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Log in to access your account')).toBeInTheDocument();
      
      // Check role selection
      expect(screen.getByText('I am a:')).toBeInTheDocument();
      expect(screen.getByLabelText('Doctor')).toBeInTheDocument();
      expect(screen.getByLabelText('Patient')).toBeInTheDocument();
      
      // Check form fields
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      
      // Check buttons and links
      expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should have patient role selected by default', () => {
      render(<Login />);
      
      const patientRadio = screen.getByLabelText('Patient');
      expect(patientRadio).toBeChecked();
    });

    it('should render MedScribe logo and link to home', () => {
      render(<Login />);
      
      expect(screen.getByText('MedScribe')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should allow user to type in email and password fields', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'testpassword');
      
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('testpassword');
    });

    it('should allow user to switch between doctor and patient roles', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
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

    it('should require email and password fields', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      const submitButton = screen.getByRole('button', { name: 'Log In' });
      
      await user.click(submitButton);
      
      // Form should not submit without required fields
      // Since the form has HTML5 validation, we check that navigate wasn't called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login', () => {
    it('should login doctor successfully and navigate to doctor dashboard', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      // Select doctor role
      await user.click(screen.getByLabelText('Doctor'));
      
      // Fill form
      await user.type(screen.getByLabelText('Email Address'), 'doctor@test.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Log In' }));
      
      // Wait for the request to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
      });
      
      // Check localStorage
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'doctor');
      });
    });

    it('should login patient successfully and navigate to patient dashboard', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      // Patient is selected by default
      
      // Fill form
      await user.type(screen.getByLabelText('Email Address'), 'patient@test.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Log In' }));
      
      // Wait for the request to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
      
      // Check localStorage
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'patient');
      });
    });

    it('should show success toast on successful login', async () => {
      const user = userEvent.setup();
      render(<Login />);
      
      await user.type(screen.getByLabelText('Email Address'), 'doctor@test.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      await user.click(screen.getByRole('button', { name: 'Log In' }));
      
      await waitFor(() => {
        expect(screen.getByText('Login successful')).toBeInTheDocument();
      });
    });
  });

  describe('Failed Login', () => {

    it('should handle network errors gracefully', async () => {
      // Override the login handler to simulate network error
      server.use(
        http.post(`${TEST_API_BASE_URL}/api/auth/login`, () => {
          return HttpResponse.error();
        })
      );

      const user = userEvent.setup();
      render(<Login />);
      
      await user.type(screen.getByLabelText('Email Address'), 'test@test.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      await user.click(screen.getByRole('button', { name: 'Log In' }));
      
      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      // Add delay to the login handler for this specific test
      server.use(
        http.post(`${TEST_API_BASE_URL}/api/auth/login`, async ({ request }) => {
          // Add a delay to simulate slower network
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const { email, password } = await request.json() as { email: string; password: string };
          
          if (email === 'doctor@test.com' && password === 'password123') {
            return HttpResponse.json({
              user: {
                id: 1,
                name: 'Dr. Test',
                email: 'doctor@test.com',
                role: 'DOCTOR'
              }
            });
          }
          
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      const user = userEvent.setup();
      render(<Login />);
      
      await user.type(screen.getByLabelText('Email Address'), 'doctor@test.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Log In' });
      
      // Click submit and immediately check for loading state
      await user.click(submitButton);
      
      // Check if button shows loading text
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      
      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();
      
      // Wait for the request to complete
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
      });
    });

    it('should disable button during submission', async () => {
      // Alternative test focusing on button state
      const user = userEvent.setup();
      render(<Login />);
      
      await user.type(screen.getByLabelText('Email Address'), 'doctor@test.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Log In' });
      
      // Initially button should be enabled
      expect(submitButton).not.toBeDisabled();
      
      // Click submit
      const clickPromise = user.click(submitButton);
      
      // Check that button becomes disabled immediately
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      
      await clickPromise;
      
      // Wait for completion
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct navigation links', () => {
      render(<Login />);
      
      const signUpLink = screen.getByRole('link', { name: 'Sign Up' });
      const forgotPasswordLink = screen.getByRole('link', { name: 'Forgot password?' });
      const homeLink = screen.getByRole('link', { name: 'MedScribe' });
      
      expect(signUpLink).toHaveAttribute('href', '/signup');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});