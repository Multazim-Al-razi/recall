import { describe, expect, it } from 'vitest'

/**
 * Trivial smoke test confirming the Vitest toolchain (runner, jsdom
 * environment, globals, and setup file) is wired up correctly.
 */
describe('test toolchain smoke test', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('has the jsdom window environment available', () => {
    expect(typeof window).toBe('object')
    expect(typeof window.matchMedia).toBe('function')
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
  })
})
