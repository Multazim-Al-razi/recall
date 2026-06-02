import { clsx } from 'clsx';
import { Inbox } from 'lucide-react';

interface Props {
  /** Message announced to assistive technology and shown in the chart area. */
  message: string;
  /** Optional extra classes applied to the wrapper. */
  className?: string;
}

/**
 * Shared empty/error message for charts.
 *
 * Rendered by `ChartErrorBoundary` and `ChartFrame` whenever a chart has no data
 * to show or fails to render. Uses `role="status"` so the message is announced to
 * assistive technology (Requirement 8.5) and stays visually calm and on-brand with
 * the warm editorial surface tokens (Requirement 13.3).
 */
export function ChartEmptyState({ message, className }: Props) {
  return (
    <div
      role="status"
      className={clsx(
        'flex min-h-[200px] w-full flex-col items-center justify-center gap-2 px-6 py-8 text-center',
        className,
      )}
    >
      <Inbox aria-hidden className="h-5 w-5 text-muted/60" strokeWidth={1.75} />
      <p className="max-w-[24ch] text-[13px] leading-relaxed text-muted">{message}</p>
    </div>
  );
}
