import { useState, useEffect } from 'react';

export const GITHUB_HANDLE = 'Multazim-Al-razi';
export const GITHUB_REPO = 'Multazim-Al-razi/recall';
export const GITHUB_URL = 'https://github.com/Multazim-Al-razi/recall';

const STAR_THRESHOLD = 100;

interface UseGitHubStarsResult {
  stars: number | null;
  formatted: string | null;
  visible: boolean;
  loading: boolean;
}

function formatStars(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}

export function useGitHubStars(): UseGitHubStarsResult {
  const [stars, setStars] = useState<number | null>(() => {
    const cached = sessionStorage.getItem('recall:gh-stars');
    return cached ? Number(cached) : null;
  });
  const [loading, setLoading] = useState(stars === null);

  useEffect(() => {
    if (stars !== null) return;

    fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
          sessionStorage.setItem('recall:gh-stars', String(data.stargazers_count));
        }
      })
      .catch(() => setStars(null))
      .finally(() => setLoading(false));
  }, [stars]);

  const visible = stars !== null && stars >= STAR_THRESHOLD;
  const formatted = stars !== null ? formatStars(stars) : null;

  return { stars, formatted, visible, loading };
}
