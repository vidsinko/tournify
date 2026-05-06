import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg border bg-surface-900 text-white placeholder-surface-500",
              "border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
              "px-3 py-2 text-sm transition-colors outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-10 rounded-lg border bg-surface-900 text-white",
            "border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
            "px-3 py-2 text-sm transition-colors outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-danger-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-surface-900 text-white placeholder-surface-500",
            "border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
            "px-3 py-2 text-sm transition-colors outline-none resize-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-danger-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-danger-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Select, Textarea };
