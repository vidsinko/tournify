import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
  hover?: boolean;
}

function Card({ className, variant = "default", hover = false, ...props }: CardProps) {
  const variants = {
    default: "bg-white border border-gray-200/80",
    elevated: "bg-white border border-gray-200/80 shadow-sm",
    glass: "bg-white/80 backdrop-blur-md border border-gray-200/60",
  };
  return (
    <div
      className={cn(
        "rounded-2xl",
        variants[variant],
        hover && "transition-all cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-px",
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
    <div className={cn("px-5 py-4 border-t border-gray-100", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold text-gray-900", className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-gray-500 mt-0.5", className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
