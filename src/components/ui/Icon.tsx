import { cn } from "@/lib/utils";

type IconProps = {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number;
};

/** Material Symbols Outlined icon. `filled` toggles the FILL axis. */
export function Icon({ name, filled, className, size }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none", className)}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : undefined,
        fontSize: size ? `${size}px` : undefined,
      }}
    >
      {name}
    </span>
  );
}
