import { http, HttpResponse } from 'msw';
import { TEST_API_BASE_URL } from '../config';

const BASE_URL = `${TEST_API_BASE_URL}/api`;

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

export const handlers = [
  // Auth handlers
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json() as LoginRequest;
    
    // Mock successful login
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
    
    if (email === 'patient@test.com' && password === 'password123') {
      return HttpResponse.json({
        user: {
          id: 2,
          name: 'Patient Test',
          email: 'patient@test.com',
          role: 'PATIENT'
        }
      });
    }
    
    // Mock failed login
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${BASE_URL}/auth/signup`, async ({ request }) => {
    const userData = await request.json() as SignupRequest;
    
    // Mock failed registration (email already exists)
    if (userData.email === 'existing@test.com') {
      return HttpResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }
    
    // Mock successful registration
    if (userData.email && userData.password && userData.name) {
      const role = userData.role || 'PATIENT';
      return HttpResponse.json({
        id: 3,
        name: userData.name,
        email: userData.email,
        role: role
      });
    }
    
    // Mock failed registration (missing fields)
    return HttpResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    );
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get(`${BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      role: 'PATIENT'
    });
  }),
];