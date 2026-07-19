"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { FootballFormat, TeamType, TeamRole, MembershipStatus } from "@prisma/client";
import { notify } from "@/lib/actions/notifications";

const teamSchema = z.object({
  name: z.string().trim().min(2).max(60),
  shortName: z.string().trim().max(10).optional(),
  description: z.string().trim().max(500).optional(),
  district: z.string().trim().max(40).optional(),
  format: z.nativeEnum(FootballFormat),
  type: z.nativeEnum(TeamType),
});

async function uniqueTeamSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 0;
  while (await prisma.team.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export async function createTeam(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    shortName: formData.get("shortName") || undefined,
    description: formData.get("description") || undefined,
    district: formData.get("district") || undefined,
    format: formData.get("format"),
    type: formData.get("type"),
  });
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const slug = await uniqueTeamSlug(parsed.data.name);
  const team = await prisma.team.create({
    data: {
      ...parsed.data,
      shortName: parsed.data.shortName ?? null,
      description: parsed.data.description ?? null,
      district: parsed.data.district ?? null,
      slug,
      members: { create: { userId, role: TeamRole.OWNER, status: MembershipStatus.ACTIVE } },
    },
  });
  revalidatePath("/teams");
  redirect(`/teams/${team.slug}`);
}

export async function requestToJoin(teamId: string, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (existing) return { ok: false as const, error: "Already a member or request pending" };

  await prisma.teamMember.create({
    data: { teamId, userId, role: TeamRole.PLAYER, status: MembershipStatus.PENDING },
  });

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } });
  const owner = await prisma.teamMember.findFirst({
    where: { teamId, role: TeamRole.OWNER },
    select: { userId: true },
  });
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  if (owner) {
    await notify({
      userId: owner.userId,
      actorId: userId,
      type: "JOIN_REQUEST",
      title: `${me?.name ?? "A player"} wants to join ${team?.name}`,
      link: path,
    });
  }
  revalidatePath(path);
  return { ok: true as const };
}

async function assertCanManage(teamId: string, userId: string) {
  const actor = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  const managerRoles: TeamRole[] = [TeamRole.OWNER, TeamRole.MANAGER];
  return !!actor && managerRoles.includes(actor.role);
}

export async function updateMember(
  memberId: string,
  data: { role?: TeamRole; jerseyNumber?: number | null },
  path: string
) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member) return { ok: false as const, error: "Not found" };
  if (!(await assertCanManage(member.teamId, userId))) {
    return { ok: false as const, error: "Not authorized" };
  }
  await prisma.teamMember.update({
    where: { id: memberId },
    data: {
      ...(data.role ? { role: data.role } : {}),
      ...(data.jerseyNumber !== undefined ? { jerseyNumber: data.jerseyNumber } : {}),
    },
  });
  revalidatePath(path);
  return { ok: true as const };
}

export async function removeMember(memberId: string, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member) return { ok: false as const, error: "Not found" };
  if (member.role === TeamRole.OWNER) return { ok: false as const, error: "Cannot remove the owner" };
  if (!(await assertCanManage(member.teamId, userId))) {
    return { ok: false as const, error: "Not authorized" };
  }
  await prisma.teamMember.delete({ where: { id: memberId } });
  revalidatePath(path);
  return { ok: true as const };
}

export async function respondToJoinRequest(memberId: string, approve: boolean, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: { team: { include: { members: true } } },
  });
  if (!member) return { ok: false as const, error: "Request not found" };

  const actor = member.team.members.find((m) => m.userId === userId);
  const managerRoles: TeamRole[] = [TeamRole.OWNER, TeamRole.MANAGER];
  if (!actor || !managerRoles.includes(actor.role)) {
    return { ok: false as const, error: "Not authorized" };
  }

  if (approve) {
    await prisma.teamMember.update({ where: { id: memberId }, data: { status: MembershipStatus.ACTIVE } });
    await notify({
      userId: member.userId,
      actorId: userId,
      type: "TEAM_INVITE",
      title: `You joined ${member.team.name}`,
      link: `/teams/${member.team.slug}`,
    });
  } else {
    await prisma.teamMember.delete({ where: { id: memberId } });
  }
  revalidatePath(path);
  return { ok: true as const };
}
