import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium font-ui transition-colors duration-150 rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary: 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-xs active:scale-[0.99]',
      secondary: 'bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[var(--border)] active:scale-[0.99]',
      outline: 'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:scale-[0.99]',
      ghost: 'bg-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]',
      destructive: 'bg-rose-900/20 text-rose-400 border border-rose-900/40 hover:bg-rose-900/30 active:scale-[0.99]',
    };

    const sizes = {
      sm: 'text-[0.8rem] px-[0.75rem] py-[0.35rem] gap-[0.35rem]',
      md: 'text-[0.875rem] px-[1rem] py-[0.5rem] gap-[0.5rem]',
      lg: 'text-[1rem] px-[1.25rem] py-[0.65rem] gap-[0.65rem]',
      icon: 'w-[2.25rem] h-[2.25rem] p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-[1rem] h-[1rem] animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
