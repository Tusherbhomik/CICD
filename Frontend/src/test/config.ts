// Test configuration constants
export const TEST_API_BASE_URL = 'http://localhost:8080';

// Override API_BASE_URL for tests to avoid import.meta issues
export const getApiBaseUrl = () => {
  // In test environment, use the test URL
  if (typeof global !== 'undefined' && global.process?.env?.NODE_ENV === 'test') {
    return TEST_API_BASE_URL;
  }
  
  // In normal environment, try to use Vite env or fallback
  try {
    return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080';
  } catch {
    return 'http://localhost:8080';
  }
};