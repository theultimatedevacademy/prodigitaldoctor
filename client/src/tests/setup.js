/**
 * Test setup file
 * Configure testing environment and global mocks
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock Clerk
if (typeof window !== 'undefined') {
  window.Clerk = {
    session: {
      getToken: () => Promise.resolve('mock-token'),
      reload: () => Promise.resolve(),
    },
  };
}
