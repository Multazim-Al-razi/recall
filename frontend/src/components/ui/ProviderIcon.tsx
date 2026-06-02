import { useState } from 'react';
import openaiIcon from '@/assets/icons/openai.svg';
import { safeProviderIconSlug } from '@/lib/security';

/**
 * Local overrides for brand icons that Simple Icons no longer serves
 * (e.g. OpenAI was removed from the CDN for trademark reasons in v16).
 * Keyed by the provider `icon` slug used across the app.
 */
const LOCAL_ICONS: Record<string, string> = {
  openai: openaiIcon,
};

interface Props {
  /** Simple Icons slug (e.g. "netflix") or a key in LOCAL_ICONS. */
  icon?: string;
  /** Provider name — used for alt text and the initial fallback. */
  name: string;
  /** Pixel size of the rendered glyph. */
  size?: number;
  className?: string;
}

/**
 * Renders a provider brand glyph with a graceful fallback chain:
 *   1. A bundled local SVG when the CDN no longer serves the slug.
 *   2. The Simple Icons CDN.
 *   3. The provider's first initial, if the image fails to load.
 *
 * F-2: the icon slug is allowlisted through `safeProviderIconSlug` so an
 * attacker-controlled value can't escape the CDN path (e.g. `../../foo`).
 */
export function ProviderIcon({ icon, name, size = 22, className }: Props) {
  const [failed, setFailed] = useState(false);

  const safeSlug = safeProviderIconSlug(icon);
  const src = safeSlug
    ? LOCAL_ICONS[safeSlug] ?? `https://cdn.simpleicons.org/${safeSlug}`
    : undefined;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size }}
        // F-6: don't leak the page origin to the icon CDN.
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="font-bold text-ink/30"
      style={{ fontSize: Math.round(size * 0.72), lineHeight: 1 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
