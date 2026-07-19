"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/feed") return pathname === "/feed";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="hidden lg:flex flex-col h-[calc(100vh-64px)] fixed left-0 top-16 p-md gap-md border-r border-outline-variant w-64 bg-surface z-40">
      <div className="flex flex-col gap-xs">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-sm px-md py-sm rounded-xl transition-all duration-200",
                active
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container"
              )}
            >
              <Icon name={item.icon} filled={active} />
              <span className="text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto flex flex-col gap-xs">
        <Link
          href="/feed?compose=1"
          className="bg-primary text-on-primary w-full py-sm rounded-xl font-bold text-label-md hover:opacity-90 active:scale-95 transition-all text-center"
        >
          Create Post
        </Link>
        <div className="border-t border-outline-variant my-sm" />
        {SECONDARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-on-surface-variant flex items-center gap-sm px-md py-sm hover:bg-surface-container transition-all duration-200 rounded-xl"
          >
            <Icon name={item.icon} />
            <span className="text-label-md">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/feed", label: "Home", icon: "home" },
    { href: "/explore", label: "Explore", icon: "explore" },
    { href: "/tournaments", label: "Play", icon: "emoji_events" },
    { href: "/notifications", label: "Alerts", icon: "notifications" },
    { href: "/me", label: "Profile", icon: "account_circle" },
  ];
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-outline-variant flex justify-around h-16">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1",
              active ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <Icon name={item.icon} filled={active} size={24} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
