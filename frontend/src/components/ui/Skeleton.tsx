import { clsx } from 'clsx';

interface SkeletonProps {
  /** Width class, e.g. 'w-24' */
  width?: string;
  /** Height class, e.g. 'h-4' */
  height?: string;
  /** Border radius: 'sm' | 'md' | 'lg' | 'full' */
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

const ROUNDED: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-[6px]',
  md: 'rounded-[10px]',
  lg: 'rounded-[16px]',
  full: 'rounded-full',
};

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
  className,
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-ink/6',
        width,
        height,
        ROUNDED[rounded],
        className,
      )}
      aria-hidden
    />
  );
}

/** Pre-built skeleton card that mirrors the SubscriptionCard layout. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex min-h-[260px] flex-col rounded-[20px] bg-surface p-7',
        className,
      )}
    >
      <Skeleton width="w-14" height="h-14" rounded="lg" />
      <Skeleton width="w-3/5" height="h-4" className="mt-5" />
      <Skeleton width="w-2/5" height="h-3" className="mt-2" />
      <Skeleton width="w-1/3" height="h-3" className="mt-2" />
      <div className="mt-auto flex items-center justify-between border-t border-ink/5 pt-[18px]">
        <Skeleton width="w-20" height="h-5" rounded="sm" />
        <Skeleton width="w-24" height="h-3" rounded="sm" />
      </div>
    </div>
  );
}

/** Pre-built skeleton row for lists / tables. */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center gap-3 py-3', className)}>
      <Skeleton width="w-8" height="h-8" rounded="full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton width="w-2/5" height="h-3" rounded="sm" />
        <Skeleton width="w-1/4" height="h-2.5" rounded="sm" />
      </div>
      <Skeleton width="w-16" height="h-4" rounded="sm" />
    </div>
  );
}
