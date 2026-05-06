import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "live" | "danger" | "warning" | "success" | "outline";
  size?: "sm" | "md";
  pulse?: boolean;
}

function Badge({
  className,
  variant = "default",
  size = "md",
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-surface-700 text-surface-200",
    brand: "bg-brand-900/60 text-brand-300 border border-brand-800",
    live: "bg-live-900/40 text-live-400 border border-live-800",
    danger: "bg-danger-900/40 text-danger-400 border border-danger-800",
    warning: "bg-warning-900/40 text-warning-400 border border-warning-800",
    success: "bg-live-900/40 text-live-400 border border-live-800",
    outline: "border border-surface-600 text-surface-300",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-0.5 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live-500" />
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge };
