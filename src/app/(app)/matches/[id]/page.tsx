import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

type Props = { params: Promise<{ id: string }> };

async function getMatch(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      venue: true,
      tournament: { include: { organizer: true } },
      events: { orderBy: [{ minute: "asc" }, { createdAt: "asc" }] },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const m = await getMatch(id);
  if (!m) return { title: "Match" };
  return { title: `${m.homeTeam.name} vs ${m.awayTeam.name}` };
}

const EVENT_ICON: Record<string, string> = {
  GOAL: "sports_soccer",
  OWN_GOAL: "sports_soccer",
  YELLOW_CARD: "square",
  RED_CARD: "square",
  SUBSTITUTION: "swap_horiz",
  INJURY: "personal_injury",
  PENALTY: "sports_score",
  SHOOTOUT_GOAL: "sports_soccer",
  SHOOTOUT_MISS: "block",
  CORNER: "flag",
  OFFSIDE: "flag",
};

export default async function MatchCenterPage({ params }: Props) {
  const { id } = await params;
  const [m, viewerId] = await Promise.all([getMatch(id), getCurrentUserId()]);
  if (!m) notFound();

  const isOrganizer = viewerId && m.tournament?.organizer.ownerId === viewerId;
  const live = m.status === "LIVE" || m.status === "HALFTIME";

  return (
    <div className="max-w-3xl mx-auto px-md py-lg space-y-lg">
      {m.tournament && (
        <div className="flex items-center justify-between">
          <Link href={`/tournaments/${m.tournament.slug}?tab=fixtures`} className="text-primary font-bold text-label-md flex items-center gap-xs">
            <Icon name="arrow_back" size={18} /> {m.tournament.name}
          </Link>
          {isOrganizer && (
            <Link href={`/matches/${m.id}/control`} className="bg-primary text-on-primary px-md py-2 rounded-lg font-label-md flex items-center gap-xs">
              <Icon name="sports" size={18} /> Live Control
            </Link>
          )}
        </div>
      )}

      {/* Scoreboard */}
      <section className="bg-white rounded-xl border border-outline-variant premium-card-shadow p-lg">
        <div className="flex items-center justify-center gap-sm mb-md">
          {live && (
            <span className="bg-error text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" /> {m.status === "HALFTIME" ? "HT" : "Live"}
            </span>
          )}
          <span className="text-label-md text-on-surface-variant">{m.round ?? "Match"}</span>
        </div>
        <div className="flex items-center justify-between">
          <TeamBlock name={m.homeTeam.name} logo={m.homeTeam.logo} slug={m.homeTeam.slug} />
          <div className="flex flex-col items-center px-md">
            {m.status === "SCHEDULED" ? (
              <span className="text-body-md text-on-surface-variant">
                {m.kickoff ? new Date(m.kickoff).toLocaleString() : "TBD"}
              </span>
            ) : (
              <div className="text-[48px] md:text-[64px] font-black leading-none flex items-center gap-md">
                <span>{m.homeScore}</span>
                <span className="text-surface-variant">:</span>
                <span>{m.awayScore}</span>
              </div>
            )}
            {m.status === "COMPLETED" && <Badge tone="neutral" className="mt-sm">Full time</Badge>}
            {(m.homeShootout != null || m.awayShootout != null) && (
              <span className="text-label-sm text-on-surface-variant mt-1">
                Pens {m.homeShootout ?? 0}-{m.awayShootout ?? 0}
              </span>
            )}
          </div>
          <TeamBlock name={m.awayTeam.name} logo={m.awayTeam.logo} slug={m.awayTeam.slug} />
        </div>
        {m.venue && (
          <p className="text-center text-label-md text-on-surface-variant mt-md flex items-center justify-center gap-1">
            <Icon name="stadium" size={16} /> {m.venue.name}
          </p>
        )}
      </section>

      {/* Timeline */}
      <section className="bg-white rounded-xl border border-outline-variant p-lg">
        <h3 className="text-title-lg font-title-lg mb-md">Match Events</h3>
        {m.events.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">No events recorded yet.</p>
        ) : (
          <ul className="space-y-sm">
            {m.events.map((e) => {
              const isHome = e.teamId === m.homeTeamId;
              return (
                <li key={e.id} className={`flex items-center gap-sm ${isHome ? "" : "flex-row-reverse text-right"}`}>
                  <span className="w-10 shrink-0 text-label-md text-on-surface-variant font-mono">
                    {e.minute != null ? `${e.minute}'` : "—"}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      e.type === "RED_CARD"
                        ? "bg-error text-white"
                        : e.type === "YELLOW_CARD"
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-primary-container/15 text-primary"
                    }`}
                  >
                    <Icon name={EVENT_ICON[e.type] ?? "circle"} size={18} filled />
                  </span>
                  <div className="min-w-0">
                    <p className="font-label-md text-body-md truncate">
                      {e.playerName ?? e.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {e.type.replace(/_/g, " ").toLowerCase()}
                      {e.type === "GOAL" && e.relatedPlayerId ? " (assisted)" : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function TeamBlock({ name, logo, slug }: { name: string; logo: string | null; slug: string }) {
  return (
    <Link href={`/teams/${slug}`} className="flex flex-col items-center gap-sm flex-1 min-w-0">
      <Avatar src={logo} name={name} size={72} className="!rounded-2xl border-4 border-white shadow-sm" />
      <span className="font-title-lg text-body-lg text-center truncate w-full px-1">{name}</span>
    </Link>
  );
}
