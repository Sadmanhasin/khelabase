import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const tournaments = await p.tournament.findMany({ select: { id: true, slug: true } });
  for (const t of tournaments) {
    const [regs, matches] = await Promise.all([
      p.tournamentTeam.findMany({ where: { tournamentId: t.id, status: "APPROVED" } }),
      p.match.findMany({ where: { tournamentId: t.id, status: "COMPLETED" } }),
    ]);
    const table = new Map<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }>();
    for (const r of regs) table.set(r.teamId, { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 });
    for (const m of matches) {
      const h = table.get(m.homeTeamId);
      const a = table.get(m.awayTeamId);
      if (!h || !a) continue;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) { h.won++; h.pts += 3; a.lost++; }
      else if (m.homeScore < m.awayScore) { a.won++; a.pts += 3; h.lost++; }
      else { h.drawn++; a.drawn++; h.pts++; a.pts++; }
    }
    for (const [teamId, s] of table) {
      await p.standing.upsert({
        where: { tournamentId_teamId: { tournamentId: t.id, teamId } },
        create: { tournamentId: t.id, teamId, played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, goalsFor: s.gf, goalsAgainst: s.ga, points: s.pts },
        update: { played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, goalsFor: s.gf, goalsAgainst: s.ga, points: s.pts },
      });
    }
    console.log(`Recomputed ${t.slug}: ${table.size} teams`);
  }
}

main().catch(console.error).finally(() => p.$disconnect());
