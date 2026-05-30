import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
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
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full rounded-[10px] border bg-canvas px-3.5 py-2.5 text-sm transition-colors',
              'placeholder:text-muted/60',
              'focus:border-rausch focus:outline-none',
              error
                ? 'border-rausch/60 focus:border-rausch'
                : 'border-ink/10',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className,
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[12px] text-rausch">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[12px] text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
