import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={clsx(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-rausch/8 text-rausch">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-[320px] text-[13px] leading-[1.6] text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
