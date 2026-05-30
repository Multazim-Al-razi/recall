import '@testing-library/jest-dom'
import { vi } from 'vitest'

/**
 * Default `window.matchMedia` mock.
 *
 * jsdom does not implement `matchMedia`, but several components (e.g. the
 * `useReducedMotion` hook and recharts) read it. This provides a safe default
 * that reports "no match" for every query (so reduced motion is OFF by
 * default). Individual tests can override `window.matchMedia` to simulate a
 * `(prefers-reduced-motion: reduce)` match when exercising reduced-motion paths.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated, kept for legacy callers
    removeListener: vi.fn(), // deprecated, kept for legacy callers
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
