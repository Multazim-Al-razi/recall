import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <label
      className={clsx(
        'inline-flex cursor-pointer items-center gap-2.5',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative h-[22px] w-[40px] rounded-full transition-colors',
          checked ? 'bg-rausch' : 'bg-ink/15',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={clsx(
            'absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm',
            checked ? 'left-[20px]' : 'left-[2px]',
          )}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-ink">{label}</span>
      )}
    </label>
  );
}
