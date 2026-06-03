import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

export const GITHUB_HANDLE = 'Multazim-Al-razi';
export const GITHUB_REPO = 'Multazim-Al-razi/recall';
export const GITHUB_URL = 'https://github.com/Multazim-Al-razi/recall';

/** Minimum stars required before the badge becomes visible. */
const STAR_THRESHOLD = 100;

/** Inline GitHub mark — lucide-react dropped brand icons, so we ship our own. */
export function GithubMark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      role="img"
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/**
 * Formats a star count for display (e.g. 123 → "123", 1234 → "1.2k").
 */
function formatStars(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(n);
}

interface UseGitHubStarsResult {
  stars: number | null;
  formatted: string | null;
  visible: boolean;
  loading: boolean;
}

/**
 * Fetches stargazers_count from the GitHub API once per session,
 * caches in sessionStorage, and hides the badge below the threshold.
 */
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

interface Props {
  className?: string;
  /** Compact mode hides the handle text, showing only the star count. */
  compact?: boolean;
}

/** GitHub repo link with a star count, styled for the marketing nav. */
export function GithubStars({ className = '', compact = false }: Props) {
  const { formatted, visible, loading } = useGitHubStars();

  if (loading || !visible) return null;

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${GITHUB_HANDLE} on GitHub — ${formatted} stars`}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink ${className}`}
    >
      <GithubMark size={15} />
      {!compact && <span>{GITHUB_HANDLE}</span>}
      <span className="flex items-center gap-0.5 text-ink/55">
        <Star size={12} className="fill-current" />
        {formatted}
      </span>
    </a>
  );
}
