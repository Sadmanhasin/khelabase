import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TournamentStatusControl } from "./TournamentStatusControl";

export const metadata = { title: "Admin · Tournaments" };

export default async function AdminTournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { organizer: { select: { name: true } }, _count: { select: { teams: true, matches: true } } },
  });

  return (
    <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
      {tournaments.length === 0 && <p className="p-lg text-body-md text-on-surface-variant">No tournaments.</p>}
      {tournaments.map((t) => (
        <div key={t.id} className="flex flex-wrap items-center gap-sm p-md">
          <div className="min-w-0 flex-1">
            <Link href={`/tournaments/${t.slug}`} className="font-label-md text-body-md hover:text-primary truncate block">{t.name}</Link>
            <p className="text-label-sm text-on-surface-variant truncate">
              {t.organizer.name} · {t._count.teams} teams · {t._count.matches} matches
            </p>
          </div>
          <TournamentStatusControl id={t.id} status={t.status} />
        </div>
      ))}
    </div>
  );
}
