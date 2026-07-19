"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PlayerPosition, PreferredFoot, ExperienceLevel } from "@prisma/client";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  bio: z.string().trim().max(280).optional(),
  district: z.string().trim().max(40).optional(),
  phone: z.string().trim().max(20).optional(),
});

export async function updateProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") || undefined,
    district: formData.get("district") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio ?? null,
      district: parsed.data.district ?? null,
      phone: parsed.data.phone ?? null,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/me");
  return { ok: true as const };
}

const playerSchema = z.object({
  preferredPosition: z.nativeEnum(PlayerPosition).optional(),
  secondaryPosition: z.nativeEnum(PlayerPosition).optional(),
  preferredFoot: z.nativeEnum(PreferredFoot).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  heightCm: z.coerce.number().int().min(120).max(230).optional(),
  jerseyNumber: z.coerce.number().int().min(0).max(99).optional(),
  playingStyle: z.string().trim().max(60).optional(),
  lookingForTeam: z.boolean().optional(),
});

export async function updatePlayerProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const raw = {
    preferredPosition: (formData.get("preferredPosition") as string) || undefined,
    secondaryPosition: (formData.get("secondaryPosition") as string) || undefined,
    preferredFoot: (formData.get("preferredFoot") as string) || undefined,
    experienceLevel: (formData.get("experienceLevel") as string) || undefined,
    heightCm: (formData.get("heightCm") as string) || undefined,
    jerseyNumber: (formData.get("jerseyNumber") as string) || undefined,
    playingStyle: (formData.get("playingStyle") as string) || undefined,
    lookingForTeam: formData.get("lookingForTeam") === "on",
  };
  const parsed = playerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  await prisma.playerProfile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/me");
  revalidatePath("/settings");
  return { ok: true as const };
}
