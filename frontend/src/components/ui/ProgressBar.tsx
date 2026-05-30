import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type Tone = 'rausch' | 'success' | 'warning';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  tone?: Tone;
  /** Shows the percentage label */
  showLabel?: boolean;
  height?: 'thin' | 'default' | 'thick';
  className?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  rausch: 'bg-rausch',
  success: 'bg-success',
  warning: 'bg-warning',
};

const HEIGHT: Record<NonNullable<ProgressBarProps['height']>, string> = {
  thin: 'h-1',
  default: 'h-1.5',
  thick: 'h-3',
};

export function ProgressBar({
  value,
  tone = 'rausch',
  showLabel = false,
  height = 'default',
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium">
          <span className="text-muted">Usage</span>
          <span className="text-ink">{Math.round(clamped)}%</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full overflow-hidden rounded-full bg-ink/6',
          HEIGHT[height],
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className={clsx('h-full rounded-full', TONE_CLASSES[tone])}
        />
      </div>
    </div>
  );
}
