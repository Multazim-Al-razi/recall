import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  form?: string;
  'aria-label'?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-rausch text-white hover:bg-rausch-hover hover:-translate-y-0.5 shadow-sm',
  secondary:
    'bg-ink/5 text-ink hover:bg-ink/10 hover:-translate-y-0.5',
  ghost:
    'bg-transparent text-muted hover:text-ink hover:bg-ink/5',
  outline:
    'border border-ink/15 text-ink hover:border-rausch/40 hover:text-rausch hover:-translate-y-0.5',
  danger:
    'bg-rausch/10 text-rausch hover:bg-rausch/20',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-[12px] gap-1.5',
  md: 'px-5 py-2.5 text-[14px] gap-2',
  lg: 'px-8 py-3.5 text-[15px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'pointer-events-none opacity-50',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </motion.button>
  );
}
