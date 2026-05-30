import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/40',
      secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    };

    const sizes = {
      sm: 'py-2 px-4 text-xs',
      md: 'py-3 px-6 text-sm',
      lg: 'py-4 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          'font-bold rounded-xl transition-all flex items-center justify-center gap-2 group',
          !disabled && !isLoading && 'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
          (disabled || isLoading) && 'opacity-70 cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {children}
            {icon && <span className="group-hover:translate-x-0.5 transition-transform">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
