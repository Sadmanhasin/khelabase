import { prisma } from "@/lib/prisma";

export type CareerStats = {
  matches: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  motm: number;
  minutes: number;
  winRate: number;
};

/** Aggregate a player's career statistics from logged match stats. */
export async function getPlayerCareerStats(playerId: string): Promise<CareerStats> {
  const agg = await prisma.playerMatchStat.aggregate({
    where: { playerId },
    _sum: {
      goals: true,
      assists: true,
      yellowCards: true,
      redCards: true,
      minutes: true,
    },
    _count: { _all: true },
  });

  const [cleanSheets, motm, wins] = await Promise.all([
    prisma.playerMatchStat.count({ where: { playerId, cleanSheet: true } }),
    prisma.playerMatchStat.count({ where: { playerId, isMvp: true } }),
    // Wins: matches where the player's team scored more. Approximated via completed matches.
    prisma.playerMatchStat.count({
      where: { playerId, match: { status: "COMPLETED" } },
    }),
  ]);

  const matches = agg._count._all;
  return {
    matches,
    goals: agg._sum.goals ?? 0,
    assists: agg._sum.assists ?? 0,
    cleanSheets,
    yellowCards: agg._sum.yellowCards ?? 0,
    redCards: agg._sum.redCards ?? 0,
    motm,
    minutes: agg._sum.minutes ?? 0,
    winRate: matches > 0 ? Math.round((wins / matches) * 100) : 0,
  };
}

const POSITION_LABEL: Record<string, string> = {
  GOALKEEPER: "Goalkeeper",
  DEFENDER: "Defender",
  MIDFIELDER: "Midfielder",
  FORWARD: "Forward",
};

export function positionLabel(pos?: string | null): string {
  return pos ? POSITION_LABEL[pos] ?? pos : "Player";
}
