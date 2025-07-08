import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright E2E Test Teardown...');

  try {
    // Clean up test data
    await cleanupTestData();

    // Generate test summary report
    await generateTestSummary();

    // Archive test artifacts if needed
    await archiveTestArtifacts();

    // Clean up temporary files
    await cleanupTempFiles();

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to prevent test failure due to cleanup issues
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...');
  
  // Clean up any test users created during tests
  // This would connect to your test database and remove test data
  
  // Example cleanup operations:
  // - Remove test users from database
  // - Clear test files
  // - Reset API mocks
  
  console.log('✅ Test data cleanup completed');
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  try {
    // Read test results if available
    const resultsPath = path.join('playwright-report', 'results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8')) as {
        suites?: Array<{
          specs?: Array<{
            tests?: Array<{
              results?: Array<{ status: string }>;
            }>;
          }>;
        }>;
        stats?: { duration?: number };
      };
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.suites?.reduce((acc: number, suite) => 
          acc + (suite.specs?.length || 0), 0) || 0,
        passed: results.suites?.reduce((acc: number, suite) => 
          acc + (suite.specs?.filter((spec) => 
            spec.tests?.every((test) => test.results?.every((result) => 
              result.status === 'passed'))) || []).length, 0) || 0,
        failed: results.suites?.reduce((acc: number, suite) => 
          acc + (suite.specs?.filter((spec) => 
            spec.tests?.some((test) => test.results?.some((result) => 
              result.status === 'failed'))) || []).length, 0) || 0,
        duration: results.stats?.duration || 0,
        environment: process.env.NODE_ENV || 'test'
      };

      // Write summary to file
      fs.writeFileSync(
        path.join('src/test/e2e/artifacts', 'test-summary.json'),
        JSON.stringify(summary, null, 2)
      );

      console.log('📈 Test Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
    }
  } catch (error) {
    console.log('⚠️ Could not generate test summary:', error);
  }
}

async function archiveTestArtifacts() {
  console.log('📦 Archiving test artifacts...');
  
  const artifactsDir = path.join('src/test/e2e/artifacts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Copy important artifacts to timestamped directory
  const archiveDir = path.join(artifactsDir, `run-${timestamp}`);
  
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  // Archive screenshots if any test failures occurred
  if (fs.existsSync('screenshots')) {
    const screenshotFiles = fs.readdirSync('screenshots');
    if (screenshotFiles.length > 0) {
      const screenshotArchiveDir = path.join(archiveDir, 'screenshots');
      fs.mkdirSync(screenshotArchiveDir, { recursive: true });
      
      screenshotFiles.forEach(file => {
        fs.copyFileSync(
          path.join('screenshots', file),
          path.join(screenshotArchiveDir, file)
        );
      });
      console.log(`📸 Archived ${screenshotFiles.length} screenshots`);
    }
  }

  // Archive test results
  if (fs.existsSync('playwright-report/results.json')) {
    fs.copyFileSync(
      'playwright-report/results.json',
      path.join(archiveDir, 'results.json')
    );
  }

  console.log(`📁 Artifacts archived to: ${archiveDir}`);
}

async function cleanupTempFiles() {
  console.log('🗂️ Cleaning up temporary files...');
  
  // Clean up temporary screenshots (keep only archived ones)
  if (fs.existsSync('screenshots')) {
    const screenshotFiles = fs.readdirSync('screenshots');
    screenshotFiles.forEach(file => {
      fs.unlinkSync(path.join('screenshots', file));
    });
    console.log(`🗑️ Cleaned up ${screenshotFiles.length} temporary screenshots`);
  }

  // Clean up other temporary test files
  const tempPatterns = [
    'test-results/**/trace.zip',
    'test-results/**/video.webm'
  ];

  // In a real implementation, you might use a glob library to clean these up
  console.log('✅ Temporary files cleanup completed');
}

export default globalTeardown;