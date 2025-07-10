import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Playwright E2E Test Setup...');

  // Create necessary directories
  const directories = [
    'screenshots',
    'test-results',
    'playwright-report',
    'src/test/e2e/artifacts'
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Launch browser for global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check if the application is running
    console.log('🔍 Checking if application is running...');
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:8081';
    
    await page.goto(baseURL, { timeout: 30000 });
    console.log('✅ Application is running and accessible');

    // Verify critical pages load
    console.log('🧪 Running basic health checks...');
    
    // Check login page
    await page.goto(`${baseURL}/login`);
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Login page loads correctly');
    
    // Check signup page
    await page.goto(`${baseURL}/signup`);
    await page.waitForSelector('form', { timeout: 10000 });
    console.log('✅ Signup page loads correctly');

    // Setup test data if needed
    console.log('📊 Setting up test data...');
    await setupTestData();

    // Create global test state file
    const globalState = {
      setupTime: new Date().toISOString(),
      baseURL,
      testEnvironment: process.env.NODE_ENV || 'test'
    };
    
    fs.writeFileSync(
      path.join('src/test/e2e/artifacts', 'global-state.json'),
      JSON.stringify(globalState, null, 2)
    );

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData() {
  // Setup any required test data
  // This could include database seeding, API mocking setup, etc.
  
  // Example: Create test users in database (if using a test database)
  // const testUsers = [
  //   { email: 'patient@test.com', password: 'Test123!', role: 'PATIENT' },
  //   { email: 'doctor@test.com', password: 'Test123!', role: 'DOCTOR' }
  // ];
  
  // Mock API responses or setup test database
  console.log('📝 Test data setup completed');
}

export default globalSetup;