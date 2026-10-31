import * as React from 'react';
import { cn } from '../lib/utils';
import { Search } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, icon, id, 'aria-describedby': describedBy, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-[0.75rem] top-[50%] -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none">
            <Search className="w-[1rem] h-[1rem]" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          aria-invalid={error ? true : ariaInvalid}
          aria-describedby={[describedBy, error && errorId].filter(Boolean).join(' ') || undefined}
          className={cn(
            'flex w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-[0.875rem] py-[0.5rem] text-[0.875rem] font-ui text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-colors focus-visible:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-[2.25rem]',
            error && 'border-rose-500/70 focus-visible:border-rose-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-[0.35rem] text-[0.75rem] text-rose-400 font-ui transition-all animate-in fade-in-50">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
