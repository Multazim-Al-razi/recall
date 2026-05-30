import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StatCardProps {
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sublabel?: string;
  /** Accent color class for the icon chip, e.g. 'bg-rausch/10 text-rausch' */
  accentClassName?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accentClassName = 'bg-rausch/10 text-rausch',
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={clsx(
        'flex flex-col rounded-[18px] bg-surface p-5',
        className,
      )}
    >
      <div
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-[12px]',
          accentClassName,
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="mt-4 text-[28px] font-bold leading-none tracking-[-1px] text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-muted">
        {label}
      </div>
      {sublabel && (
        <div className="mt-1 text-[12px] text-muted">{sublabel}</div>
      )}
    </motion.div>
  );
}
