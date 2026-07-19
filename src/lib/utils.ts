/** Merge conditional class names. Lightweight clsx replacement. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Slugify a string for use in URLs (team/tournament/venue slugs). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/** Ensure a slug is unique by appending a short random suffix when needed. */
export function uniqueSlug(base: string): string {
  return `${slugify(base)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Format a number compactly (1.2k, 3.4m). */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Relative time like "2h ago". */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.34, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let value = seconds;
  let unit = "s";
  let divisor = 1;
  for (const [step, label] of units) {
    if (value < step * divisor) {
      unit = label;
      break;
    }
    divisor *= step;
  }
  const out = Math.max(1, Math.floor(value / divisor));
  return `${out}${unit} ago`;
}

/** Districts of Bangladesh — used across profile/team/tournament forms. */
export const BD_DISTRICTS = [
  "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal", "Rangpur",
  "Mymensingh", "Comilla", "Gazipur", "Narayanganj", "Bogura", "Jashore",
  "Cox's Bazar", "Dinajpur", "Faridpur", "Tangail", "Pabna", "Kushtia", "Noakhali",
] as const;
