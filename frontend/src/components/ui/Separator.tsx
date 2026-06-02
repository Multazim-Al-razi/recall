import { clsx } from 'clsx';

interface SeparatorProps {
  /** Optional label in the middle of the separator */
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({
  label,
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        className={clsx('mx-2 w-px self-stretch bg-ink/6', className)}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={clsx('flex items-center gap-3', className)}
      >
        <div className="h-px flex-1 bg-ink/6" />
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-[1px] text-muted">
          {label}
        </span>
        <div className="h-px flex-1 bg-ink/6" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={clsx('h-px w-full bg-ink/6', className)}
    />
  );
}
