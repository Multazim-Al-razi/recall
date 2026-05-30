import type { CSSProperties } from 'react';
import type { IllustrationKey } from '@/lib/visuals';
import { illustrations } from '@/lib/visuals';

interface Props {
  /** Semantic slot from the visual registry. */
  name: IllustrationKey;
  className?: string;
  style?: CSSProperties;
  /**
   * Decorative illustrations sit beside real text, so they default to
   * aria-hidden. Set `decorative={false}` when the image carries meaning
   * not otherwise available to screen readers.
   */
  decorative?: boolean;
  loading?: 'lazy' | 'eager';
}

/**
 * Renders a registered illustration as an <img>. Centralising this keeps alt
 * text, lazy-loading, and the visual registry consistent across the app.
 */
export function Illustration({
  name,
  className,
  style,
  decorative = true,
  loading = 'lazy',
}: Props) {
  const meta = illustrations[name];
  return (
    <img
      src={meta.src}
      alt={decorative ? '' : meta.alt}
      aria-hidden={decorative || undefined}
      loading={loading}
      draggable={false}
      className={className}
      style={style}
    />
  );
}
