"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TournamentStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isAdmin: true },
  });
  return user?.isAdmin ? user : null;
}

export async function toggleUserVerified(userId: string) {
  if (!(await requireAdmin())) return { ok: false as const, error: "Admin only" };
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { isVerified: true } });
  if (!u) return { ok: false as const, error: "Not found" };
  await prisma.user.update({ where: { id: userId }, data: { isVerified: !u.isVerified } });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function toggleUserAdmin(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "Admin only" };
  if (admin.id === userId) return { ok: false as const, error: "You can't change your own admin status" };
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!u) return { ok: false as const, error: "Not found" };
  await prisma.user.update({ where: { id: userId }, data: { isAdmin: !u.isAdmin } });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function setTournamentStatusAdmin(tournamentId: string, status: TournamentStatus) {
  if (!(await requireAdmin())) return { ok: false as const, error: "Admin only" };
  await prisma.tournament.update({ where: { id: tournamentId }, data: { status } });
  revalidatePath("/admin/tournaments");
  return { ok: true as const };
}
