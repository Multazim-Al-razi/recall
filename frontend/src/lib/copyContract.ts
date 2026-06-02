/**
 * Copy contract — the canonical strings the marketing surface guarantees.
 *
 * Marketing copy drifts. E2E and unit tests that pin exact strings drift
 * with it. The fix: put every "this must stay this way" string in one
 * module, and have *both* the component and the test import from here.
 *
 * When a string genuinely needs to change, the change shows up as a single
 * diff in this file, and the test suite tells you exactly which assertions
 * are about to break.
 *
 * Keep this file UI-component-free — it must be importable from Vitest
 * without pulling in React, framer-motion, or the router.
 */
export const COPY = {
  /** Home page hero h1. Pinned because it's the single biggest line on the page. */
  homeHeroHeadline: "The money leaving your account, finally in your hands.",

  /**
   * The single word inside the hero h1 that gets the gradient accent.
   * Stored separately so the component can render the gradient while
   * tests still see the full headline as one string.
   */
  homeHeroAccent: "hands",

  /** Trust signals under the home hero CTA. */
  homeTrustSignals: [
    "Runs locally",
    "No sign-up",
    "No ads",
    "We never see your data",
  ],

  /** Hero CTA primary action label. */
  homePrimaryCta: "Start tracking free",

  /** Hero CTA secondary action label. */
  homeSecondaryCta: "See plans",

  /** Bottom CTA label. */
  homeBottomCta: "Get started",

  /** Feature trio headlines. */
  homeFeatures: [
    "Never miss a renewal",
    "See where money goes",
    "Find quiet savings",
  ],
} as const;
