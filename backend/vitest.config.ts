import { defineConfig } from 'vitest/config';

/**
 * Vitest config for the backend.
 *
 * The backend's TypeScript uses `.js` import specifiers (the ESM convention
 * when the actual file is `.ts`) and moduleResolution: 'bundler', which
 * Vitest picks up out of the box. We keep this config minimal: no path
 * aliases, no transforms beyond Vitest's defaults, no globals (we use
 * explicit `import { describe, it, expect } from 'vitest'` everywhere).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Run tests serially because the in-process write mutex in db.ts is
    // module-level state; running in parallel would mix fixture state.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    testTimeout: 15000,
  },
});
