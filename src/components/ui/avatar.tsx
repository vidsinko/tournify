import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  const initials = getInitials(name);
  const colors = [
    "bg-brand-700",
    "bg-purple-700",
    "bg-emerald-700",
    "bg-amber-700",
    "bg-rose-700",
    "bg-cyan-700",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white",
        sizeClasses[size],
        colors[colorIndex],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
