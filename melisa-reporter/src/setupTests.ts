import '@testing-library/jest-dom';

// Mock console methods to keep test output clean
const originalConsole = { ...console };

beforeAll(() => {
  // Optional: Suppress console output during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  // Restore original console
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});