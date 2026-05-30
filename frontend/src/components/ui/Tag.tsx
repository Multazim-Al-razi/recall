import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

type Tone = 'rausch' | 'success' | 'warning' | 'muted' | 'ink';

interface TagProps {
  children: ReactNode;
  tone?: Tone;
  onRemove?: () => void;
  icon?: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  rausch: 'bg-rausch/10 text-rausch',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  muted: 'bg-ink/6 text-muted',
  ink: 'bg-ink/8 text-ink',
};

export function Tag({
  children,
  tone = 'muted',
  onRemove,
  icon,
  className,
}: TagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 flex items-center justify-center rounded-full p-0.5 transition-colors hover:bg-current/10"
          aria-label="Remove"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
