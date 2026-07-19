"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { AwardType } from "@prisma/client";

/**
 * Recompute automatic awards for a tournament from logged player stats.
 * Clears existing non-custom awards and regenerates them.
 */
export async function computeTournamentAwards(tournamentId: string, path?: string) {
  const userId = await getCurrentUserId();
  if (userId) {
    const t = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { organizer: true },
    });
    if (!t || t.organizer.ownerId !== userId) {
      return { ok: false as const, error: "Not authorized" };
    }
  }

  const matchIds = (
    await prisma.match.findMany({ where: { tournamentId }, select: { id: true } })
  ).map((m) => m.id);
  if (matchIds.length === 0) return { ok: false as const, error: "No matches yet" };

  const stats = await prisma.playerMatchStat.groupBy({
    by: ["playerId"],
    where: { matchId: { in: matchIds } },
    _sum: { goals: true, assists: true, cleanSheets: true, yellowCards: true, redCards: true },
    _count: { _all: true },
  });
  const cleanSheetCounts = await prisma.playerMatchStat.groupBy({
    by: ["playerId"],
    where: { matchId: { in: matchIds }, cleanSheet: true },
    _count: { _all: true },
  });
  const csMap = new Map(cleanSheetCounts.map((c) => [c.playerId, c._count._all]));

  if (stats.length === 0) return { ok: false as const, error: "No player stats recorded yet" };

  const rows = stats.map((s) => ({
    playerId: s.playerId,
    goals: s._sum.goals ?? 0,
    assists: s._sum.assists ?? 0,
    cleanSheets: csMap.get(s.playerId) ?? 0,
    cards: (s._sum.yellowCards ?? 0) + (s._sum.redCards ?? 0) * 2,
  }));

  const top = <T,>(arr: T[], score: (t: T) => number): T | null =>
    arr.reduce<T | null>((best, cur) => (best === null || score(cur) > score(best) ? cur : best), null);

  const awards: { type: AwardType; title: string; playerId: string | null }[] = [];
  const scorer = top(rows.filter((r) => r.goals > 0), (r) => r.goals);
  if (scorer) awards.push({ type: "TOP_SCORER", title: "Top Scorer", playerId: scorer.playerId });
  const assister = top(rows.filter((r) => r.assists > 0), (r) => r.assists);
  if (assister) awards.push({ type: "MOST_ASSISTS", title: "Most Assists", playerId: assister.playerId });
  const gk = top(rows.filter((r) => r.cleanSheets > 0), (r) => r.cleanSheets);
  if (gk) awards.push({ type: "BEST_GOALKEEPER", title: "Best Goalkeeper", playerId: gk.playerId });
  const mvp = top(rows, (r) => r.goals * 2 + r.assists);
  if (mvp && mvp.goals + mvp.assists > 0) awards.push({ type: "MVP", title: "Tournament MVP", playerId: mvp.playerId });
  // Fair play: fewest cards among players who appeared.
  const fair = top(rows, (r) => -r.cards);
  if (fair) awards.push({ type: "FAIR_PLAY", title: "Fair Play", playerId: fair.playerId });

  // Replace previously-computed automatic awards (keep CUSTOM ones).
  await prisma.award.deleteMany({ where: { tournamentId, type: { not: "CUSTOM" } } });
  await prisma.award.createMany({
    data: awards.map((a) => ({ tournamentId, type: a.type, title: a.title, playerId: a.playerId })),
  });

  if (path) revalidatePath(path);
  return { ok: true as const, count: awards.length };
}
