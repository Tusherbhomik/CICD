import axios from 'axios';
import { API_BASE_URL } from '@/url';

const BASE_URL = `${API_BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject({ message });
  }
);

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string, role: string) => {
    const response = await apiClient.post(`/auth/login`, { email, password });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post(`/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success/failure
      localStorage.removeItem('userRole');
    }
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    birthDate: string;
    gender: string;
  }) => {
    const response = await apiClient.post(`/auth/signup`, data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get(`/auth/me`);
    return response.data;
  },

  // Forgot password - send reset email
  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/auth/password/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to send reset email');
    }

    return response.text();
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${BASE_URL}/auth/password/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to reset password');
    }

    return response.text();
  },

  // Validate reset token
  validateResetToken: async (token) => {
    const response = await fetch(`${BASE_URL}/auth/password/validate-token?token=${token}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Invalid or expired token');
    }

    return response.text();
  },
};

export default apiClient;