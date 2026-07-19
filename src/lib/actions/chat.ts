"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { notify } from "@/lib/actions/notifications";

/** Find or create a 1:1 conversation with another user, then open it. */
export async function startConversation(otherUserId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  if (otherUserId === userId) return { ok: false as const, error: "Can't message yourself" };

  // Look for an existing conversation shared by exactly these two users.
  const mine = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  const shared = await prisma.conversationParticipant.findFirst({
    where: { userId: otherUserId, conversationId: { in: mine.map((m) => m.conversationId) } },
  });

  let conversationId = shared?.conversationId;
  if (!conversationId) {
    const convo = await prisma.conversation.create({
      data: {
        participants: { create: [{ userId }, { userId: otherUserId }] },
      },
    });
    conversationId = convo.id;
  }
  redirect(`/messages/${conversationId}`);
}

export async function sendMessage(conversationId: string, content: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const trimmed = content.trim();
  if (!trimmed) return { ok: false as const, error: "Empty message" };

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) return { ok: false as const, error: "Not in this conversation" };

  await prisma.message.create({ data: { conversationId, senderId: userId, content: trimmed } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });

  // Notify the other participants.
  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: userId } },
    select: { userId: true },
  });
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  for (const o of others) {
    await notify({
      userId: o.userId,
      actorId: userId,
      type: "CHAT",
      title: `New message from ${me?.name ?? "someone"}`,
      body: trimmed.slice(0, 80),
      link: `/messages/${conversationId}`,
    });
  }

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return { ok: true as const };
}

export async function markConversationRead(conversationId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}
