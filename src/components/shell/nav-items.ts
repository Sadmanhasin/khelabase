export type NavItem = { href: string; label: string; icon: string };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/feed", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "explore" },
  { href: "/players", label: "Players", icon: "sports_soccer" },
  { href: "/teams", label: "Teams", icon: "group" },
  { href: "/tournaments", label: "Tournaments", icon: "emoji_events" },
  { href: "/venues", label: "Venues", icon: "stadium" },
  { href: "/marketplace", label: "Marketplace", icon: "storefront" },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/help", label: "Help", icon: "help" },
];

// Bottom nav for mobile — the five most-used destinations.
export const MOBILE_NAV: NavItem[] = [
  { href: "/feed", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "explore" },
  { href: "/tournaments", label: "Play", icon: "emoji_events" },
  { href: "/notifications", label: "Alerts", icon: "notifications" },
  { href: "/me", label: "Profile", icon: "account_circle" },
];
