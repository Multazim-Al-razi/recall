import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** ARIA label */
  'aria-label'?: string;
  children: ReactNode;
  /** Subtle hover lift effect */
  hoverable?: boolean;
  /** Adds a dashed border style (used for trial cards, empty states) */
  dashed?: boolean;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_CLASSES: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-7',
};

export function Card({
  children,
  hoverable = false,
  dashed = false,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={clsx(
        'rounded-[20px] bg-surface',
        dashed
          ? 'border-2 border-dashed border-ink/8 bg-transparent'
          : 'border border-hairline',
        PADDING_CLASSES[padding],
        hoverable && 'cursor-pointer transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
