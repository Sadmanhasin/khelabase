"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { MatchEventType, MatchStatus } from "@prisma/client";
import { recomputeStandings } from "@/lib/actions/tournaments";

/** True if the user organizes the tournament this match belongs to. */
async function canControlMatch(matchId: string, userId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: { include: { organizer: true } } },
  });
  if (!match) return null;
  if (match.tournament && match.tournament.organizer.ownerId === userId) return match;
  return null;
}

const SCORING: MatchEventType[] = ["GOAL", "SHOOTOUT_GOAL"];

/** Roster for a match: active players of both teams, with their player-profile ids. */
export async function getMatchRoster(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { homeTeamId: true, awayTeamId: true },
  });
  if (!match) return { home: [], away: [] };

  async function roster(teamId: string) {
    const members = await prisma.teamMember.findMany({
      where: { teamId, status: "ACTIVE" },
      include: { user: { include: { playerProfile: true } } },
    });
    return members
      .filter((m) => m.user.playerProfile)
      .map((m) => ({
        playerId: m.user.playerProfile!.id,
        name: m.user.name ?? "Player",
        jersey: m.jerseyNumber,
        position: m.user.playerProfile!.preferredPosition,
      }));
  }

  const [home, away] = await Promise.all([roster(match.homeTeamId), roster(match.awayTeamId)]);
  return { home, away };
}

async function bumpStat(
  matchId: string,
  playerId: string,
  field: "goals" | "assists" | "yellowCards" | "redCards" | "ownGoals"
) {
  await prisma.playerMatchStat.upsert({
    where: { matchId_playerId: { matchId, playerId } },
    create: { matchId, playerId, [field]: 1 },
    update: { [field]: { increment: 1 } },
  });
}

export type LogEventInput = {
  matchId: string;
  type: MatchEventType;
  side: "HOME" | "AWAY";
  minute?: number;
  playerId?: string;
  playerName?: string;
  relatedPlayerId?: string; // assist provider / sub-in
  note?: string;
};

export async function logMatchEvent(input: LogEventInput, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const match = await canControlMatch(input.matchId, userId);
  if (!match) return { ok: false as const, error: "Not authorized" };

  const teamId = input.side === "HOME" ? match.homeTeamId : match.awayTeamId;

  await prisma.matchEvent.create({
    data: {
      matchId: input.matchId,
      type: input.type,
      minute: input.minute,
      teamId,
      playerId: input.playerId,
      playerName: input.playerName,
      relatedPlayerId: input.relatedPlayerId,
      note: input.note,
    },
  });

  // Score side effects
  if (SCORING.includes(input.type)) {
    await prisma.match.update({
      where: { id: input.matchId },
      data: input.side === "HOME" ? { homeScore: { increment: 1 } } : { awayScore: { increment: 1 } },
    });
  } else if (input.type === "OWN_GOAL") {
    // Own goal credits the *other* side.
    await prisma.match.update({
      where: { id: input.matchId },
      data: input.side === "HOME" ? { awayScore: { increment: 1 } } : { homeScore: { increment: 1 } },
    });
  }

  // Player stat side effects
  if (input.playerId) {
    if (input.type === "GOAL") await bumpStat(input.matchId, input.playerId, "goals");
    else if (input.type === "OWN_GOAL") await bumpStat(input.matchId, input.playerId, "ownGoals");
    else if (input.type === "YELLOW_CARD") await bumpStat(input.matchId, input.playerId, "yellowCards");
    else if (input.type === "RED_CARD") await bumpStat(input.matchId, input.playerId, "redCards");
  }
  if (input.type === "GOAL" && input.relatedPlayerId) {
    await bumpStat(input.matchId, input.relatedPlayerId, "assists");
  }

  revalidatePath(path);
  return { ok: true as const };
}

export async function deleteMatchEvent(eventId: string, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const event = await prisma.matchEvent.findUnique({ where: { id: eventId } });
  if (!event) return { ok: false as const, error: "Not found" };
  const match = await canControlMatch(event.matchId, userId);
  if (!match) return { ok: false as const, error: "Not authorized" };

  const isHome = event.teamId === match.homeTeamId;

  // Reverse score
  if (SCORING.includes(event.type)) {
    await prisma.match.update({
      where: { id: event.matchId },
      data: isHome ? { homeScore: { decrement: 1 } } : { awayScore: { decrement: 1 } },
    });
  } else if (event.type === "OWN_GOAL") {
    await prisma.match.update({
      where: { id: event.matchId },
      data: isHome ? { awayScore: { decrement: 1 } } : { homeScore: { decrement: 1 } },
    });
  }

  // Reverse stats
  const dec = async (playerId: string, field: "goals" | "assists" | "yellowCards" | "redCards" | "ownGoals") => {
    await prisma.playerMatchStat.updateMany({
      where: { matchId: event.matchId, playerId },
      data: { [field]: { decrement: 1 } },
    });
  };
  if (event.playerId) {
    if (event.type === "GOAL") await dec(event.playerId, "goals");
    else if (event.type === "OWN_GOAL") await dec(event.playerId, "ownGoals");
    else if (event.type === "YELLOW_CARD") await dec(event.playerId, "yellowCards");
    else if (event.type === "RED_CARD") await dec(event.playerId, "redCards");
  }
  if (event.type === "GOAL" && event.relatedPlayerId) await dec(event.relatedPlayerId, "assists");

  await prisma.matchEvent.delete({ where: { id: eventId } });
  revalidatePath(path);
  return { ok: true as const };
}

export async function setMatchStatus(matchId: string, status: MatchStatus, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const match = await canControlMatch(matchId, userId);
  if (!match) return { ok: false as const, error: "Not authorized" };

  await prisma.match.update({ where: { id: matchId }, data: { status } });

  if (status === "COMPLETED") {
    await applyCleanSheets(matchId);
    if (match.tournamentId) await recomputeStandings(match.tournamentId);
  }
  revalidatePath(path);
  return { ok: true as const };
}

/** On completion, credit goalkeepers of teams that conceded zero with a clean sheet. */
async function applyCleanSheets(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  async function creditGks(teamId: string, conceded: number) {
    const keepers = await prisma.teamMember.findMany({
      where: { teamId, status: "ACTIVE", user: { playerProfile: { preferredPosition: "GOALKEEPER" } } },
      include: { user: { include: { playerProfile: true } } },
    });
    for (const k of keepers) {
      const pid = k.user.playerProfile!.id;
      await prisma.playerMatchStat.upsert({
        where: { matchId_playerId: { matchId, playerId: pid } },
        create: { matchId, playerId: pid, cleanSheet: conceded === 0 },
        update: { cleanSheet: conceded === 0 },
      });
    }
  }

  await Promise.all([
    creditGks(match.homeTeamId, match.awayScore),
    creditGks(match.awayTeamId, match.homeScore),
  ]);
}
