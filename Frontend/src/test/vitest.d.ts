import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown>
      extends jest.Matchers<void, T>,
        matchers.TestingLibraryMatchers<T, void> {}
  }
}

expect.extend(matchers);