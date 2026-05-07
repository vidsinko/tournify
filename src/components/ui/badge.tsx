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
    default: "bg-gray-100 text-gray-600",
    brand: "bg-brand-50 text-brand-700 border border-brand-200",
    live: "bg-live-50 text-live-700 border border-live-200",
    danger: "bg-danger-50 text-danger-600 border border-danger-100",
    warning: "bg-warning-50 text-warning-600 border border-warning-100",
    success: "bg-live-50 text-live-700 border border-live-200",
    outline: "border border-gray-300 text-gray-600",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-live-500" />
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge };
