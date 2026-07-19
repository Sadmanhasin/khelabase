import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  premium,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { premium?: boolean; hover?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest border border-outline-variant rounded-xl premium-card-shadow",
        premium && "border-t-2 border-t-gold",
        hover && "transition-all hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
