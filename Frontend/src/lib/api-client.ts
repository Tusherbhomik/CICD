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
};

export default apiClient;