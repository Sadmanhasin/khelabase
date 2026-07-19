"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PostType } from "@prisma/client";

const createPostSchema = z.object({
  content: z.string().trim().min(1, "Write something first").max(2000),
  type: z.nativeEnum(PostType).optional(),
});

export async function createPost(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "You must be logged in." };

  const parsed = createPostSchema.safeParse({
    content: formData.get("content"),
    type: (formData.get("type") as string) || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }

  await prisma.post.create({
    data: {
      authorId: userId,
      content: parsed.data.content,
      type: parsed.data.type ?? "TEXT",
    },
  });
  revalidatePath("/feed");
  return { ok: true as const };
}

export async function toggleLike(postId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });
  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId } });
  }
  revalidatePath("/feed");
  return { ok: true as const, liked: !existing };
}

export async function addComment(postId: string, content: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const trimmed = content.trim();
  if (!trimmed) return { ok: false as const, error: "Empty comment" };

  await prisma.comment.create({ data: { postId, authorId: userId, content: trimmed } });
  revalidatePath("/feed");
  return { ok: true as const };
}
