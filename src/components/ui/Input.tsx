import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, containerClassName, ...props }, ref) => {
    return (
      <div className={twMerge("space-y-1.5", containerClassName)}>
        {label && (
          <label className="text-xs font-bold text-slate-700 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              "w-full py-2.5 bg-white border-2 rounded-xl outline-none transition-all font-medium text-sm text-slate-700 shadow-sm",
              icon ? "pl-10 pr-3" : "px-3",
              error 
                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                : "border-slate-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 hover:border-slate-300",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-red-500 ml-1 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
