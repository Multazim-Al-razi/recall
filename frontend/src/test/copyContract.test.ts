import { describe, expect, it } from 'vitest';
import { COPY } from '@/lib/copyContract';

/**
 * The copy contract is the single source of truth for marketing strings
 * that the E2E suite and unit tests pin against. These tests catch the
 * small class of mistakes (typos, accidentally removed keys, the accent
 * word drifting out of the headline) before a Playwright run does.
 */
describe('copyContract', () => {
  it('exposes the home hero headline and the matching accent word', () => {
    expect(COPY.homeHeroHeadline).toBeTruthy();
    expect(COPY.homeHeroAccent).toBeTruthy();
    // The accent word must appear in the headline so the component's
    // `replace(\` ${accent}.\`, " ")` is well-defined.
    expect(COPY.homeHeroHeadline).toContain(COPY.homeHeroAccent);
    // And the headline must end with the accent + period, so the visual
    // gradient lands on the last word and not somewhere in the middle.
    expect(COPY.homeHeroHeadline.endsWith(`${COPY.homeHeroAccent}.`)).toBe(true);
  });

  it('exposes all four trust signals', () => {
    expect(COPY.homeTrustSignals).toHaveLength(4);
    for (const signal of COPY.homeTrustSignals) {
      expect(signal.length).toBeGreaterThan(0);
    }
  });

  it('exposes the feature trio', () => {
    expect(COPY.homeFeatures).toHaveLength(3);
    // Each feature title should be a short headline, not a sentence.
    for (const feature of COPY.homeFeatures) {
      expect(feature.length).toBeLessThan(50);
    }
  });

  it('keeps CTA labels short and action-oriented', () => {
    for (const label of [
      COPY.homePrimaryCta,
      COPY.homeSecondaryCta,
      COPY.homeBottomCta,
    ]) {
      expect(label.length).toBeLessThanOrEqual(25);
    }
  });
});
