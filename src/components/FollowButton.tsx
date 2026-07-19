"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/lib/actions/follow";
import { Icon } from "@/components/ui/Icon";
import type { FollowTargetType } from "@prisma/client";

export function FollowButton({
  targetType,
  targetId,
  initialFollowing,
  path,
  size = "md",
}: {
  targetType: FollowTargetType;
  targetId: string;
  initialFollowing: boolean;
  path?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setFollowing((v) => !v);
    startTransition(async () => {
      const res = await toggleFollow(targetType, targetId, path);
      if (!res.ok) {
        setFollowing((v) => !v); // revert
      }
      router.refresh();
    });
  }

  const pad = size === "sm" ? "px-3 py-1 text-label-sm" : "px-lg py-sm text-label-md";

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center gap-xs rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 ${pad} ${
        following
          ? "bg-surface-container-high text-on-surface border border-outline-variant"
          : "bg-primary text-on-primary shadow"
      }`}
    >
      <Icon name={following ? "check" : "person_add"} size={18} />
      {following ? "Following" : "Follow"}
    </button>
  );
}
