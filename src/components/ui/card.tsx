import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
  hover?: boolean;
}

function Card({ className, variant = "default", hover = false, ...props }: CardProps) {
  const variants = {
    default: "bg-surface-800/60 border border-surface-700/50",
    elevated: "bg-surface-800/60 border border-surface-700/50 shadow-lg shadow-black/20",
    glass: "bg-surface-800/30 backdrop-blur-md border border-surface-700/40",
  };
  return (
    <div
      className={cn(
        "rounded-2xl",
        variants[variant],
        hover &&
          "transition-all cursor-pointer hover:bg-surface-800/90 hover:border-surface-600/60 hover:-translate-y-px",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pt-5 pb-3", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-t border-surface-700/50", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold text-white", className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-surface-400 mt-0.5", className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
