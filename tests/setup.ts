import { vi } from 'vitest';

// Mock fetch globally for all tests
global.fetch = vi.fn();

// Set up global test environment variables
process.env.NODE_ENV = 'test';