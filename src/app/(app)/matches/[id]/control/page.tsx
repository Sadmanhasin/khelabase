import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { getMatchRoster } from "@/lib/actions/matches";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { MatchControl } from "./MatchControl";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Live Control" };

export default async function MatchControlPage({ params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?callbackUrl=/matches/${id}/control`);

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      tournament: { include: { organizer: true } },
      events: { orderBy: [{ minute: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!match) notFound();

  if (!match.tournament || match.tournament.organizer.ownerId !== userId) {
    redirect(`/matches/${id}`);
  }

  const roster = await getMatchRoster(id);

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader
        title="Live Match Control"
        subtitle={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
        icon="sports"
        action={
          <Link href={`/matches/${id}`} className="text-primary font-bold text-label-md flex items-center gap-xs">
            <Icon name="visibility" size={18} /> Public view
          </Link>
        }
      />
      <MatchControl
        matchId={match.id}
        path={`/matches/${id}/control`}
        status={match.status}
        homeName={match.homeTeam.name}
        awayName={match.awayTeam.name}
        homeTeamId={match.homeTeamId}
        homeScore={match.homeScore}
        awayScore={match.awayScore}
        home={roster.home.map((p) => ({ playerId: p.playerId, name: p.name, jersey: p.jersey }))}
        away={roster.away.map((p) => ({ playerId: p.playerId, name: p.name, jersey: p.jersey }))}
        events={match.events.map((e) => ({ id: e.id, type: e.type, minute: e.minute, teamId: e.teamId, playerName: e.playerName }))}
      />
    </div>
  );
}
