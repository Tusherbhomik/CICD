// src/test/e2e/types/index.ts

import { Page, Locator } from '@playwright/test';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  role: 'DOCTOR' | 'PATIENT';
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'doctor' | 'patient';
}

export interface ApiResponse {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

export interface TestConfig {
  timeouts: {
    short: number;
    medium: number;
    long: number;
    apiResponse: number;
  };
  delays: {
    typing: number;
    formSubmission: number;
    networkSimulation: number;
    toastDisplay: number;
  };
  retries: {
    flaky: number;
    network: number;
    default: number;
  };
}

export interface PageObjectBase {
  page: Page;
  goto(): Promise<void>;
  waitForPageLoad(): Promise<void>;
  clearStorage(): Promise<void>;
  verifyAccessibility(): Promise<void>;
}

export interface FormValidationData {
  weakPasswords: string[];
  invalidEmails: string[];
  invalidNames: string[];
  invalidDates: string[];
  passwordMismatches: Array<{ password: string; confirm: string }>;
}

export interface EnvironmentData {
  baseUrl: string;
  apiUrl: string;
}

export interface TestDataFixtures {
  validFormData: {
    signup: TestUser;
    login: LoginCredentials;
  };
  boundaryValues: {
    minName: string;
    maxName: string;
    minPassword: string;
    maxPassword: string;
    oldestBirthDate: string;
    youngestBirthDate: string;
  };
  specialCharacters: {
    nameWithAccents: string;
    nameWithApostrophe: string;
    emailWithPlus: string;
    passwordWithSpecialChars: string;
  };
}

export interface MockApiEndpoints {
  successfulLogin: ApiResponse;
  successfulSignup: ApiResponse;
  loginError: ApiError;
  signupError: ApiError;
  validationError: ApiError;
  networkError: ApiError;
}

export interface BrowserConfig {
  launch: (options?: { 
    args?: string[]; 
    headless?: boolean; 
    slowMo?: number;
  }) => Promise<import('@playwright/test').Browser>;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ResponsiveBreakpoint {
  name: string;
  width: number;
  height: number;
}

export interface TestHelperOptions {
  clear?: boolean;
  delay?: number;
  timeout?: number;
  retries?: number;
}

export interface AccessibilityOptions {
  checkImages?: boolean;
  checkLabels?: boolean;
  checkHeadings?: boolean;
}

export interface PerformanceMetrics {
  loadTime: number;
  submissionTime: number;
  renderTime: number;
}

export interface TestSummary {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  environment: string;
}

export interface CleanupPatterns {
  testEmailPrefix: string;
  testDomains: string[];
  generatedUserPrefix: string;
}

export interface StressTestScenarios {
  rapidFormSubmissions: number;
  concurrentLogins: number;
  bulkRegistrations: number;
}

// Extend Playwright's Page type with custom methods
declare module '@playwright/test' {
  interface Page {
    mockApiResponse(endpoint: string, response: unknown, status?: number): Promise<void>;
    simulateNetworkFailure(endpoint: string): Promise<void>;
    waitForNetworkIdle(): Promise<void>;
    clearAllData(): Promise<void>;
  }
}

declare module '@playwright/test' {
  interface Matchers<R> {
    toBeWithinLoadTime(maxTime: number): R;
    toHaveValidEmail(): R;
    toHaveSecurePassword(): R;
  }
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Role = 'DOCTOR' | 'PATIENT';
export type LoginRole = 'doctor' | 'patient';
export type TestStatus = 'passed' | 'failed' | 'skipped';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface CustomMatchers {
  toBeWithinLoadTime(maxTime: number): Promise<void>;
  toHaveValidEmail(): Promise<void>;
  toHaveSecurePassword(): Promise<void>;
}