import { cn } from "@/lib/utils";

type Tone = "primary" | "gold" | "tertiary" | "error" | "neutral" | "success";

const tones: Record<Tone, string> = {
  primary: "bg-primary-container/15 text-primary",
  gold: "bg-secondary-fixed text-on-secondary-fixed",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  error: "bg-error-container text-on-error-container",
  success: "bg-primary-fixed text-on-primary-fixed",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
