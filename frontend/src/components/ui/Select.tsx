import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, icon, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-[12px] font-medium text-ink/70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full appearance-none rounded-[10px] border bg-canvas px-3.5 py-2.5 text-sm transition-colors',
              'focus:border-rausch focus:outline-none',
              error
                ? 'border-rausch/60 focus:border-rausch'
                : 'border-ink/10',
              icon && 'pl-10',
              'pr-9',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Chevron icon */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && (
          <p className="mt-1 text-[12px] text-rausch">{error}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
