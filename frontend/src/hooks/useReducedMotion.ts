import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Reads the current `(prefers-reduced-motion: reduce)` state; SSR-safe (false when no matchMedia). */
function getInitialPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Returns true while `(prefers-reduced-motion: reduce)` matches, updating on change.
 * SSR-safe (returns false when window is undefined). Charts pass the negation to
 * recharts `isAnimationActive` and set animationDuration to 0 when reduced.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(getInitialPreference);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    // Sync in case the preference changed between the initial render and this effect.
    setPrefersReducedMotion(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
