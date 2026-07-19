"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  district: z.string().optional(),
});

export type RegisterResult = { ok: true } | { ok: false; error: string };

async function deriveUsername(name: string, email: string): Promise<string> {
  const base = slugify(name) || email.split("@")[0];
  let candidate = base;
  let n = 0;
  // Ensure uniqueness against existing usernames.
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    n += 1;
    candidate = `${base}${n}`;
  }
  return candidate;
}

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    district: formData.get("district") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, district } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const username = await deriveUsername(name, email);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      username,
      district: district || null,
      // Every account gets a football (player) identity by default.
      playerProfile: { create: {} },
    },
  });

  return { ok: true };
}
