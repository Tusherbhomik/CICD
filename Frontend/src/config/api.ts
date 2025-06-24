const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Will be proxied by nginx to backend
  : 'http://localhost:8080';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
};

export default apiConfig;
