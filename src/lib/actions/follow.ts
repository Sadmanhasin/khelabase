"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { FollowTargetType } from "@prisma/client";
import { notify } from "@/lib/actions/notifications";

export async function toggleFollow(targetType: FollowTargetType, targetId: string, path?: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  if (targetType === "USER" && targetId === userId) {
    return { ok: false as const, error: "You can't follow yourself" };
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_targetType_targetId: { followerId: userId, targetType, targetId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: userId, targetType, targetId } });
    if (targetType === "USER") {
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      await notify({
        userId: targetId,
        actorId: userId,
        type: "FOLLOW",
        title: `${me?.name ?? "Someone"} started following you`,
        link: "/me",
      });
    }
  }

  if (path) revalidatePath(path);
  return { ok: true as const, following: !existing };
}
