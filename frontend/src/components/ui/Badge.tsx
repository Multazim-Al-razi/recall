import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Tone = 'rausch' | 'success' | 'warning' | 'muted' | 'ink';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  rausch: 'bg-rausch/10 text-rausch',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-ink/6 text-muted',
  ink: 'bg-ink/8 text-ink',
};

const DOT_CLASSES: Record<Tone, string> = {
  rausch: 'bg-rausch',
  success: 'bg-success',
  warning: 'bg-warning',
  muted: 'bg-muted',
  ink: 'bg-ink',
};

export function Badge({
  children,
  tone = 'muted',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && (
        <span className={clsx('h-1.5 w-1.5 rounded-full', DOT_CLASSES[tone])} />
      )}
      {children}
    </span>
  );
}
