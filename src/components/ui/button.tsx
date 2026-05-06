"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "live";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
      primary:
        "bg-brand-600 hover:bg-brand-500 text-white shadow-sm",
      secondary:
        "bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-700",
      ghost:
        "text-surface-300 hover:text-white hover:bg-surface-800",
      danger:
        "bg-danger-600 hover:bg-danger-500 text-white shadow-sm",
      outline:
        "border border-surface-600 text-surface-200 hover:border-brand-500 hover:text-brand-400",
      live:
        "bg-live-600 hover:bg-live-500 text-white shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
