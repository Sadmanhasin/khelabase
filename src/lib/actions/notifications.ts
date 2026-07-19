"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { NotificationType } from "@prisma/client";

/** Create a notification for a user. Used across the app when events occur. */
export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  actorId?: string;
}) {
  if (params.actorId === params.userId) return; // don't notify yourself
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      actorId: params.actorId,
    },
  });
}

export async function markAllRead() {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}
