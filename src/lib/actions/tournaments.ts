"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { slugify } from "@/lib/utils";
import {
  FootballFormat,
  TournamentType,
  AgeCategory,
  Gender,
  Visibility,
} from "@prisma/client";
import { notify } from "@/lib/actions/notifications";

const tournamentSchema = z.object({
  name: z.string().trim().min(3).max(80),
  organizerId: z.string().min(1),
  description: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(80).optional(),
  format: z.nativeEnum(FootballFormat),
  type: z.nativeEnum(TournamentType),
  ageCategory: z.nativeEnum(AgeCategory),
  gender: z.nativeEnum(Gender),
  visibility: z.nativeEnum(Visibility),
  season: z.string().trim().max(20).optional(),
  entryFee: z.coerce.number().int().min(0).optional(),
  prizeMoney: z.coerce.number().int().min(0).optional(),
  maxTeams: z.coerce.number().int().min(2).max(128).optional(),
});

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let candidate = base;
  let n = 0;
  while (await prisma.tournament.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export async function ensureOrganizer(name?: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  let organizer = await prisma.organizerProfile.findFirst({ where: { ownerId: userId } });
  if (!organizer) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    organizer = await prisma.organizerProfile.create({
      data: {
        ownerId: userId,
        name: name || `${user?.name ?? "My"} Organization`,
        slug: await (async () => {
          const base = slugify(name || `${user?.name ?? "org"}-organizer`);
          let c = base;
          let i = 0;
          while (await prisma.organizerProfile.findUnique({ where: { slug: c } })) {
            i += 1;
            c = `${base}-${i}`;
          }
          return c;
        })(),
      },
    });
  }
  return organizer;
}

export async function createTournament(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const organizer = await ensureOrganizer(formData.get("organizerName") as string);
  if (!organizer) return { ok: false as const, error: "Could not resolve organizer" };

  const parsed = tournamentSchema.safeParse({
    name: formData.get("name"),
    organizerId: organizer.id,
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    format: formData.get("format"),
    type: formData.get("type"),
    ageCategory: formData.get("ageCategory"),
    gender: formData.get("gender"),
    visibility: formData.get("visibility"),
    season: formData.get("season") || undefined,
    entryFee: formData.get("entryFee") || undefined,
    prizeMoney: formData.get("prizeMoney") || undefined,
    maxTeams: formData.get("maxTeams") || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const slug = await uniqueSlug(parsed.data.name);
  const t = await prisma.tournament.create({
    data: {
      ...parsed.data,
      slug,
      status: "REGISTRATION_OPEN",
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      season: parsed.data.season ?? null,
    },
  });
  revalidatePath("/tournaments");
  redirect(`/tournaments/${t.slug}`);
}

export async function registerTeamForTournament(tournamentId: string, teamId: string, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  // Only a team owner/manager can register their team.
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (!membership || !["OWNER", "MANAGER"].includes(membership.role)) {
    return { ok: false as const, error: "Only team owners/managers can register" };
  }

  const existing = await prisma.tournamentTeam.findUnique({
    where: { tournamentId_teamId: { tournamentId, teamId } },
  });
  if (existing) return { ok: false as const, error: "Team already registered" };

  await prisma.tournamentTeam.create({ data: { tournamentId, teamId, status: "PENDING" } });

  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { organizer: true },
  });
  if (t) {
    await notify({
      userId: t.organizer.ownerId,
      actorId: userId,
      type: "TOURNAMENT",
      title: `A team registered for ${t.name}`,
      link: path,
    });
  }
  revalidatePath(path);
  return { ok: true as const };
}

async function assertOrganizerOwner(tournamentId: string, userId: string) {
  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { organizer: true },
  });
  return t && t.organizer.ownerId === userId ? t : null;
}

export async function respondToTeamRegistration(
  tournamentTeamId: string,
  approve: boolean,
  path: string
) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const reg = await prisma.tournamentTeam.findUnique({ where: { id: tournamentTeamId } });
  if (!reg) return { ok: false as const, error: "Not found" };
  if (!(await assertOrganizerOwner(reg.tournamentId, userId))) {
    return { ok: false as const, error: "Not authorized" };
  }

  if (approve) {
    await prisma.$transaction([
      prisma.tournamentTeam.update({ where: { id: tournamentTeamId }, data: { status: "APPROVED" } }),
      prisma.standing.upsert({
        where: { tournamentId_teamId: { tournamentId: reg.tournamentId, teamId: reg.teamId } },
        create: { tournamentId: reg.tournamentId, teamId: reg.teamId },
        update: {},
      }),
    ]);
  } else {
    await prisma.tournamentTeam.update({ where: { id: tournamentTeamId }, data: { status: "REJECTED" } });
  }
  revalidatePath(path);
  return { ok: true as const };
}

/** Round-robin fixture generator for approved teams. */
export async function generateFixtures(tournamentId: string, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const t = await assertOrganizerOwner(tournamentId, userId);
  if (!t) return { ok: false as const, error: "Not authorized" };

  const regs = await prisma.tournamentTeam.findMany({
    where: { tournamentId, status: "APPROVED" },
  });
  const teamIds = regs.map((r) => r.teamId);
  if (teamIds.length < 2) return { ok: false as const, error: "Need at least 2 approved teams" };

  // Remove existing scheduled (not-yet-played) fixtures to avoid duplicates.
  await prisma.match.deleteMany({ where: { tournamentId, status: "SCHEDULED" } });

  // Circle method round-robin.
  const ids = [...teamIds];
  if (ids.length % 2 === 1) ids.push("BYE");
  const rounds = ids.length - 1;
  const half = ids.length / 2;
  const arr = [...ids];
  const matches: { homeTeamId: string; awayTeamId: string; round: string }[] = [];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[arr.length - 1 - i];
      if (home !== "BYE" && away !== "BYE") {
        matches.push({ homeTeamId: home, awayTeamId: away, round: `Round ${r + 1}` });
      }
    }
    // rotate (keep first fixed)
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop() as string);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  await prisma.match.createMany({
    data: matches.map((m) => ({
      tournamentId,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      round: m.round,
      status: "SCHEDULED" as const,
    })),
  });

  if (t.status === "REGISTRATION_OPEN") {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { status: "ONGOING" } });
  }
  revalidatePath(path);
  return { ok: true as const, created: matches.length };
}

/** Recompute standings for a tournament from completed matches. */
export async function recomputeStandings(tournamentId: string) {
  const [regs, matches] = await Promise.all([
    prisma.tournamentTeam.findMany({ where: { tournamentId, status: "APPROVED" } }),
    prisma.match.findMany({ where: { tournamentId, status: "COMPLETED" } }),
  ]);

  const table = new Map<
    string,
    { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }
  >();
  for (const r of regs) {
    table.set(r.teamId, { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 });
  }

  for (const m of matches) {
    const home = table.get(m.homeTeamId);
    const away = table.get(m.awayTeamId);
    if (!home || !away) continue;
    home.played++; away.played++;
    home.gf += m.homeScore; home.ga += m.awayScore;
    away.gf += m.awayScore; away.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.won++; home.pts += 3; away.lost++;
    } else if (m.homeScore < m.awayScore) {
      away.won++; away.pts += 3; home.lost++;
    } else {
      home.drawn++; away.drawn++; home.pts += 1; away.pts += 1;
    }
  }

  await prisma.$transaction(
    [...table.entries()].map(([teamId, s]) =>
      prisma.standing.upsert({
        where: { tournamentId_teamId: { tournamentId, teamId } },
        create: {
          tournamentId, teamId,
          played: s.played, won: s.won, drawn: s.drawn, lost: s.lost,
          goalsFor: s.gf, goalsAgainst: s.ga, points: s.pts,
        },
        update: {
          played: s.played, won: s.won, drawn: s.drawn, lost: s.lost,
          goalsFor: s.gf, goalsAgainst: s.ga, points: s.pts,
        },
      })
    )
  );
}

export async function recordMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number,
  path: string
) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match?.tournamentId) return { ok: false as const, error: "Not found" };
  if (!(await assertOrganizerOwner(match.tournamentId, userId))) {
    return { ok: false as const, error: "Not authorized" };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, status: "COMPLETED" },
  });
  await recomputeStandings(match.tournamentId);
  revalidatePath(path);
  return { ok: true as const };
}
