"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";

type SessionUser = {
  id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
} | null;

export function TopBar({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-md lg:px-lg w-full bg-surface h-16 border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-sm">
        <Link href="/feed" className="font-display-lg text-headline-md text-primary tracking-tight">
          Khelabase
        </Link>
      </div>

      <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl mx-xl">
        <div className="relative w-full">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 focus:ring-2 focus:ring-primary text-body-md"
            placeholder="Search players, teams, tournaments..."
            type="text"
          />
        </div>
      </form>

      <div className="flex items-center gap-xs md:gap-md">
        {user ? (
          <>
            <Link
              href="/notifications"
              className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors"
            >
              <Icon name="notifications" />
            </Link>
            <Link
              href="/messages"
              className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors"
            >
              <Icon name="chat" />
            </Link>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center rounded-full border border-outline-variant"
              >
                <Avatar src={user.image} name={user.name} size={36} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl premium-card-shadow z-50 p-1">
                    <div className="px-md py-sm">
                      <p className="font-title-lg text-body-md truncate">{user.name}</p>
                      <p className="text-label-sm text-on-surface-variant truncate">
                        {user.username ? `@${user.username}` : user.id}
                      </p>
                    </div>
                    <div className="border-t border-outline-variant my-1" />
                    <MenuLink href="/me" icon="person" label="My Profile" onClick={() => setMenuOpen(false)} />
                    <MenuLink href="/me/teams" icon="group" label="My Teams" onClick={() => setMenuOpen(false)} />
                    <MenuLink href="/organizer" icon="emoji_events" label="Organizer" onClick={() => setMenuOpen(false)} />
                    <MenuLink href="/settings" icon="settings" label="Settings" onClick={() => setMenuOpen(false)} />
                    <div className="border-t border-outline-variant my-1" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left flex items-center gap-sm px-md py-sm rounded-lg text-error hover:bg-error-container/40 transition-colors"
                    >
                      <Icon name="logout" size={20} />
                      <span className="text-label-md">Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-label-md font-bold text-on-surface-variant hover:text-primary px-sm py-2"
            >
              Log in
            </Link>
            <Link
              href="/join"
              className="bg-primary text-on-primary px-lg py-2 rounded-lg font-bold text-label-md hover:opacity-90 transition-all"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
    >
      <Icon name={icon} size={20} />
      <span className="text-label-md">{label}</span>
    </Link>
  );
}
