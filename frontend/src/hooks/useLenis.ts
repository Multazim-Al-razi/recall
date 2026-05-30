import { useEffect } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';

export function useLenis() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    // Dashboard uses its own overflow-y-auto scroll container;
    // Lenis conflicts with nested scroll contexts, so skip it there.
    if (isDashboard) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isDashboard]);
}
