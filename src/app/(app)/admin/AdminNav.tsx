"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/users", label: "Users", icon: "group" },
  { href: "/admin/tournaments", label: "Tournaments", icon: "emoji_events" },
  { href: "/admin/marketplace", label: "Marketplace", icon: "storefront" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-xs border-b border-outline-variant overflow-x-auto">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cn(
              "flex items-center gap-xs px-md py-sm font-label-md text-label-md border-b-2 -mb-px whitespace-nowrap",
              active ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
            )}
          >
            <Icon name={i.icon} size={18} /> {i.label}
          </Link>
        );
      })}
    </div>
  );
}
