"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleUserVerified, toggleUserAdmin } from "@/lib/actions/admin";
import { Icon } from "@/components/ui/Icon";

export function UserActions({ userId, isVerified, isAdmin }: { userId: string; isVerified: boolean; isAdmin: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-xs">
      <button
        onClick={() => startTransition(async () => { await toggleUserVerified(userId); router.refresh(); })}
        disabled={pending}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-label-sm border transition-colors ${isVerified ? "bg-tertiary-fixed text-on-tertiary-fixed border-transparent" : "border-outline-variant text-on-surface-variant hover:border-tertiary"}`}
        title="Toggle verified"
      >
        <Icon name="verified" size={16} filled={isVerified} /> {isVerified ? "Verified" : "Verify"}
      </button>
      <button
        onClick={() => startTransition(async () => { await toggleUserAdmin(userId); router.refresh(); })}
        disabled={pending}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-label-sm border transition-colors ${isAdmin ? "bg-charcoal text-white border-transparent" : "border-outline-variant text-on-surface-variant hover:border-primary"}`}
        title="Toggle admin"
      >
        <Icon name="shield_person" size={16} /> {isAdmin ? "Admin" : "Make Admin"}
      </button>
    </div>
  );
}
