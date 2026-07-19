import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "premium" | "ghost" | "danger" | "tertiary";
type Size = "sm" | "md" | "lg";

const base =
  "cta-transition inline-flex items-center justify-center gap-xs font-label-md text-label-md rounded-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  secondary:
    "bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary",
  premium: "bg-gold text-charcoal hover:brightness-95",
  tertiary: "bg-tertiary text-on-tertiary hover:brightness-110",
  ghost: "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
  danger: "bg-error text-on-error hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-sm",
  md: "h-11 px-lg",
  lg: "h-12 px-xl text-body-md",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonAsButton | ButtonAsLink>(
  function Button({ variant = "primary", size = "md", className, children, ...props }, ref) {
    const cls = cn(base, variants[variant], sizes[size], className);
    if ("href" in props && props.href !== undefined) {
      const { href, ...rest } = props as ButtonAsLink;
      return (
        <Link href={href} className={cls} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <button ref={ref} className={cls} {...(props as ButtonAsButton)}>
        {children}
      </button>
    );
  }
);
