import { CoverageAPIService } from '../src/services/coverage-api';
import { CoverageParser } from '../src/utils/coverage-parser';
import { config } from 'dotenv';

config();

function getEnvVariable(key: string, defaultValue: string): string {
  const value = process.env[key];
  if (value === undefined) {
    console.warn(`Environment variable ${key} not found, using default: ${defaultValue}`);
  }
  return value || defaultValue;
}

function getDuration(): number {
  const durationStr = process.env.DURATION;
  if (!durationStr) {
    console.warn('DURATION not set, using default: 0');
    return 0;
  }
  
  const duration = parseInt(durationStr);
  if (isNaN(duration)) {
    console.warn(`Invalid DURATION value: ${durationStr}, using default: 0`);
    return 0;
  }
  
  return duration;
}

async function main() {
  const apiService = new CoverageAPIService();
  
  console.log('Starting coverage submission...');
  
  try {
    await apiService.testConnection();
    console.log('Connected to coverage API successfully');
  } catch (error) {
    console.error('Cannot connect to coverage API. Please check your backend.');
    console.log('Make sure your Quarkus backend is running on http://localhost:28080');
    process.exit(1);
  }

  const coverageData = CoverageParser.parseJestCoverage(
    './coverage/coverage-final.json', 
    getEnvVariable('PROJECT_NAME', 'jest-test-project'),
    getEnvVariable('BRANCH', 'main'),
    getEnvVariable('COMMIT_HASH', 'unknown'),
    getDuration()
  );

  console.log('Coverage data prepared:');
  console.log(`Project: ${coverageData.projectName}`);
  console.log(`Branch: ${coverageData.branch}`);
  console.log(`Statements: ${coverageData.summary.statements.pct.toFixed(1)}%`);
  console.log(`Branches: ${coverageData.summary.branches.pct.toFixed(1)}%`);
  console.log(`Functions: ${coverageData.summary.functions.pct.toFixed(1)}%`);
  console.log(`Lines: ${coverageData.summary.lines.pct.toFixed(1)}%`);

  try {
    await apiService.submitCoverage(coverageData);
    console.log('Coverage data successfully sent to dashboard!');
  } catch (error) {
    console.error('Failed to send coverage data');
    process.exit(1);
  }
}

main();