import { faker } from '@faker-js/faker';

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

/**
 * Generate a random test user
 */
export function generateTestUser(overrides?: Partial<TestUser>): TestUser {
  const gender = faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER'] as const);
  
  return {
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: 'Test123!@#',
    phone: faker.phone.number(),
    birthDate: faker.date.between({ 
      from: '1950-01-01', 
      to: '2005-01-01' 
    }).toISOString().split('T')[0],
    gender,
    role: faker.helpers.arrayElement(['DOCTOR', 'PATIENT'] as const),
    ...overrides
  };
}

/**
 * Generate login credentials for existing users
 */
export function generateLoginCredentials(overrides?: Partial<LoginCredentials>): LoginCredentials {
  return {
    email: faker.internet.email().toLowerCase(),
    password: 'Test123!@#',
    role: faker.helpers.arrayElement(['doctor', 'patient'] as const),
    ...overrides
  };
}

/**
 * Pre-defined test users for consistent testing
 */
export const testUsers = {
  validPatient: generateTestUser({
    name: 'John Patient',
    email: 'patient@test.com',
    password: 'ValidPass123!',
    role: 'PATIENT',
    gender: 'MALE',
    birthDate: '1990-01-15'
  }),
  
  validDoctor: generateTestUser({
    name: 'Dr. Jane Smith',
    email: 'doctor@test.com',
    password: 'ValidPass123!',
    role: 'DOCTOR',
    gender: 'FEMALE',
    birthDate: '1985-05-20'
  }),
  
  femalePatient: generateTestUser({
    name: 'Alice Johnson',
    email: 'alice@test.com',
    password: 'AlicePass123!',
    role: 'PATIENT',
    gender: 'FEMALE',
    birthDate: '1992-08-10'
  }),
  
  maleDoctor: generateTestUser({
    name: 'Dr. Robert Brown',
    email: 'robert@test.com',
    password: 'RobertPass123!',
    role: 'DOCTOR',
    gender: 'MALE',
    birthDate: '1980-12-05'
  })
};

/**
 * Login credentials for pre-defined test users
 */
export const loginCredentials = {
  validPatient: {
    email: testUsers.validPatient.email,
    password: testUsers.validPatient.password,
    role: 'patient' as const
  },
  
  validDoctor: {
    email: testUsers.validDoctor.email,
    password: testUsers.validDoctor.password,
    role: 'doctor' as const
  },
  
  invalidUser: {
    email: 'nonexistent@test.com',
    password: 'WrongPassword123!',
    role: 'patient' as const
  },
  
  invalidEmail: {
    email: 'invalid-email-format',
    password: 'ValidPass123!',
    role: 'patient' as const
  },
  
  emptyCredentials: {
    email: '',
    password: '',
    role: 'patient' as const
  }
};

/**
 * Invalid test data for validation testing
 */
export const invalidTestData = {
  weakPasswords: [
    '123',
    'password',
    '12345678',
    'abc123',
    'PASSWORD'
  ],
  
  invalidEmails: [
    'invalid-email',
    '@test.com',
    'user@',
    'user..user@test.com',
    'user@.com'
  ],
  
  invalidNames: [
    '',
    '   ',
    '123',
    'X'.repeat(101) // Too long
  ],
  
  invalidDates: [
    '2025-01-01', // Future date
    '1900-01-01', // Too old
    'invalid-date',
    ''
  ],
  
  passwordMismatches: [
    { password: 'Pass123!', confirm: 'Pass456!' },
    { password: 'Password1', confirm: 'password1' },
    { password: 'Test123!', confirm: 'Test123' }
  ]
};

/**
 * API response mocks for testing
 */
export const apiMocks = {
  successfulLogin: {
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'PATIENT'
    },
    message: 'Login successful'
  },
  
  successfulSignup: {
    id: 1,
    name: 'New User',
    email: 'newuser@example.com',
    role: 'PATIENT',
    message: 'Registration successful'
  },
  
  loginError: {
    message: 'Invalid credentials'
  },
  
  signupError: {
    message: 'Email already exists'
  },
  
  validationError: {
    message: 'Validation failed',
    errors: {
      email: 'Invalid email format',
      password: 'Password too weak'
    }
  },
  
  networkError: {
    message: 'Network error occurred'
  }
};

/**
 * Form field test data
 */
export const formTestData = {
  validFormData: {
    signup: testUsers.validPatient,
    login: loginCredentials.validPatient
  },
  
  boundaryValues: {
    minName: 'A',
    maxName: 'X'.repeat(100),
    minPassword: 'Pass123!',
    maxPassword: 'P'.repeat(50) + '123!',
    oldestBirthDate: '1920-01-01',
    youngestBirthDate: '2005-12-31'
  },
  
  specialCharacters: {
    nameWithAccents: 'José María González',
    nameWithApostrophe: "O'Connor",
    emailWithPlus: 'user+test@example.com',
    passwordWithSpecialChars: 'P@$w0rd!#$%'
  }
};

/**
 * Environment-specific test data
 */
export const environmentData = {
  development: {
    baseUrl: 'http://localhost:8081',
    apiUrl: 'http://localhost:8080/api'
  },
  
  staging: {
    baseUrl: 'https://staging.medscribe.app',
    apiUrl: 'https://staging-api.medscribe.app/api'
  },
  
  production: {
    baseUrl: 'https://medscribe.app',
    apiUrl: 'https://api.medscribe.app/api'
  }
};

/**
 * Test timeouts and delays
 */
export const testConfig = {
  timeouts: {
    short: 2000,
    medium: 5000,
    long: 10000,
    apiResponse: 15000
  },
  
  delays: {
    typing: 100,
    formSubmission: 500,
    networkSimulation: 1000,
    toastDisplay: 3000
  },
  
  retries: {
    flaky: 3,
    network: 2,
    default: 1
  }
};

/**
 * Generate test data for bulk operations
 */
export function generateBulkTestUsers(count: number, role?: 'DOCTOR' | 'PATIENT'): TestUser[] {
  return Array.from({ length: count }, (_, index) => 
    generateTestUser({
      email: `test${index + 1}@example.com`,
      role: role || faker.helpers.arrayElement(['DOCTOR', 'PATIENT'])
    })
  );
}

/**
 * Clean up test data patterns
 */
export const cleanupPatterns = {
  testEmailPrefix: 'test',
  testDomains: ['test.com', 'example.com', 'testmail.com'],
  generatedUserPrefix: 'playwright-test-'
};

/**
 * Performance test data
 */
export const performanceTestData = {
  largeDataSets: {
    manyUsers: generateBulkTestUsers(100),
    formSubmissionLoad: Array.from({ length: 10 }, () => generateTestUser())
  },
  
  stressTestScenarios: {
    rapidFormSubmissions: 5,
    concurrentLogins: 3,
    bulkRegistrations: 20
  }
};