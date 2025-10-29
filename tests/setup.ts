import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clean up after each test
});

afterAll(() => {
  // Clean up after all tests
});
