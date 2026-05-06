import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
  hover?: boolean;
}

function Card({ className, variant = "default", hover = false, ...props }: CardProps) {
  const variants = {
    default: "bg-surface-800 border border-surface-700",
    elevated: "bg-surface-800 border border-surface-700 shadow-lg",
    glass: "glass",
  };
  return (
    <div
      className={cn(
        "rounded-xl",
        variants[variant],
        hover && "transition-colors hover:border-surface-600 hover:bg-surface-700/80 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-3", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 py-4 border-t border-surface-700", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-white", className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-surface-400 mt-0.5", className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
