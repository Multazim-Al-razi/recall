import { useEffect } from 'react';
import { useAccountStore } from '@/stores/account';

/**
 * Applies the `dark` class to <html> based on the user's theme preference.
 * Respects `prefers-color-scheme` when set to 'system'.
 */
export function useTheme() {
  const theme = useAccountStore((s) => s.profile.theme);

  useEffect(() => {
    const root = document.documentElement;

    function apply(theme: string) {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      }
      // 'system' defers to the OS preference
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    apply(theme);
  }, [theme]);
}