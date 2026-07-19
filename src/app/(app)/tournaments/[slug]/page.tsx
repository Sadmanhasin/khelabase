import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "@/components/FollowButton";
import {
  RegisterTeamButton,
  RegistrationActions,
  GenerateFixturesButton,
  MatchResultForm,
  ComputeAwardsButton,
} from "./TournamentActions";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> };

async function getTournament(slug: string) {
  return prisma.tournament.findUnique({
    where: { slug },
    include: {
      organizer: true,
      venue: true,
      teams: { include: { team: true }, orderBy: { registeredAt: "asc" } },
      matches: { include: { homeTeam: true, awayTeam: true }, orderBy: [{ round: "asc" }, { kickoff: "asc" }] },
      standings: { include: { team: true } },
      awards: { include: { player: { include: { user: true } } }, orderBy: { type: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTournament(slug);
  return { title: t?.name ?? "Tournament" };
}

const TABS = ["overview", "teams", "fixtures", "standings", "awards"];

export default async function TournamentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab = "overview" } = await searchParams;
  const [t, viewerId] = await Promise.all([getTournament(slug), getCurrentUserId()]);
  if (!t) notFound();

  const path = `/tournaments/${slug}`;
  const isOrganizer = viewerId === t.organizer.ownerId;

  const approved = t.teams.filter((x) => x.status === "APPROVED");
  const pending = t.teams.filter((x) => x.status === "PENDING");

  const following = viewerId
    ? await prisma.follow.findUnique({
        where: { followerId_targetType_targetId: { followerId: viewerId, targetType: "TOURNAMENT", targetId: t.id } },
      })
    : null;

  // Teams the viewer can register (they own/manage, not already registered).
  const registeredTeamIds = new Set(t.teams.map((x) => x.teamId));
  const myTeams = viewerId
    ? (
        await prisma.teamMember.findMany({
          where: { userId: viewerId, role: { in: ["OWNER", "MANAGER"] }, status: "ACTIVE" },
          include: { team: true },
        })
      )
        .filter((m) => !registeredTeamIds.has(m.teamId))
        .map((m) => ({ id: m.teamId, name: m.team.name }))
    : [];

  const sortedStandings = [...t.standings].sort(
    (a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor
  );

  return (
    <div className="max-w-container-max mx-auto px-md py-lg space-y-lg">
      {/* Hero */}
      <section className="bg-white rounded-xl border border-outline-variant premium-card-shadow overflow-hidden">
        <div className="h-40 md:h-52 bg-gradient-to-br from-primary to-primary-container relative flex items-center justify-center">
          {t.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon name="emoji_events" size={64} className="text-white/80" filled />
          )}
        </div>
        <div className="p-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <div className="flex items-center gap-xs flex-wrap mb-xs">
                <Badge tone={t.status === "ONGOING" ? "success" : "primary"}>{t.status.replace(/_/g, " ")}</Badge>
                <Badge tone="neutral">{t.type.replace(/_/g, " ")}</Badge>
                <Badge tone="neutral">{t.format.replace("F", "")}v{t.format.replace("F", "")}</Badge>
                <Badge tone="neutral">{t.ageCategory}</Badge>
              </div>
              <h1 className="text-headline-lg font-extrabold">{t.name}</h1>
              <div className="flex items-center gap-sm mt-xs text-body-md text-on-surface-variant flex-wrap">
                <Link href={`/organizer/${t.organizer.slug}`} className="flex items-center gap-1 hover:text-primary">
                  <Icon name="shield" size={16} /> {t.organizer.name}
                </Link>
                {t.venue && <span className="flex items-center gap-1"><Icon name="stadium" size={16} /> {t.venue.name}</span>}
                {t.season && <span className="flex items-center gap-1"><Icon name="calendar_month" size={16} /> {t.season}</span>}
              </div>
            </div>
            <div className="flex items-center gap-sm">
              {viewerId && !isOrganizer && (
                <FollowButton targetType="TOURNAMENT" targetId={t.id} initialFollowing={!!following} path={path} />
              )}
              {isOrganizer && (
                <Link href={`/tournaments/${slug}/dashboard`} className="bg-white border border-outline-variant px-lg py-sm rounded-xl font-label-md flex items-center gap-xs hover:bg-surface-container-low">
                  <Icon name="dashboard" size={18} /> Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-lg">
            <Fact icon="group" label="Teams" value={String(approved.length)} />
            <Fact icon="sports_soccer" label="Matches" value={String(t.matches.length)} />
            <Fact icon="paid" label="Prize" value={t.prizeMoney ? `৳${t.prizeMoney.toLocaleString()}` : "—"} />
            <Fact icon="payments" label="Entry Fee" value={t.entryFee ? `৳${t.entryFee.toLocaleString()}` : "Free"} />
          </div>
        </div>
      </section>

      {/* Register / organizer registration control bar */}
      {viewerId && !isOrganizer && t.status === "REGISTRATION_OPEN" && (
        <section className="bg-white rounded-xl border border-outline-variant p-md flex flex-wrap items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <Icon name="how_to_reg" className="text-primary" />
            <span className="font-label-md text-body-md">Registration is open — enter your team.</span>
          </div>
          <RegisterTeamButton tournamentId={t.id} myTeams={myTeams} path={path} />
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-xs border-b border-outline-variant overflow-x-auto">
        {TABS.map((x) => (
          <Link
            key={x}
            href={`${path}?tab=${x}`}
            className={`px-md py-sm font-label-md text-label-md capitalize border-b-2 -mb-px whitespace-nowrap ${
              tab === x ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            {x}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-sm">About this tournament</h3>
          <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">
            {t.description || "No description provided."}
          </p>
          {t.rules && (
            <>
              <h4 className="font-title-lg text-body-lg mt-lg mb-xs">Rules</h4>
              <p className="text-body-md text-on-surface-variant whitespace-pre-wrap">{t.rules}</p>
            </>
          )}
        </section>
      )}

      {tab === "teams" && (
        <div className="space-y-lg">
          {isOrganizer && pending.length > 0 && (
            <section className="bg-white rounded-xl border border-outline-variant p-lg">
              <h3 className="text-title-lg font-title-lg mb-md">Pending registrations ({pending.length})</h3>
              <div className="divide-y divide-outline-variant">
                {pending.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-sm">
                    <div className="flex items-center gap-sm">
                      <Avatar src={r.team.logo} name={r.team.name} size={40} />
                      <span className="font-label-md text-body-md">{r.team.name}</span>
                    </div>
                    <RegistrationActions regId={r.id} path={path} />
                  </div>
                ))}
              </div>
            </section>
          )}
          <section className="bg-white rounded-xl border border-outline-variant p-lg">
            <h3 className="text-title-lg font-title-lg mb-md">Participating teams ({approved.length})</h3>
            {approved.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">No teams approved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
                {approved.map((r) => (
                  <Link key={r.id} href={`/teams/${r.team.slug}`} className="flex items-center gap-sm p-sm rounded-lg border border-outline-variant hover:border-primary transition-colors">
                    <Avatar src={r.team.logo} name={r.team.name} size={40} />
                    <span className="font-label-md text-body-md truncate">{r.team.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "fixtures" && (
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-title-lg font-title-lg">Fixtures &amp; Results</h3>
            {isOrganizer && <GenerateFixturesButton tournamentId={t.id} path={`${path}?tab=fixtures`} />}
          </div>
          {t.matches.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">
              No fixtures yet.{isOrganizer ? " Approve teams, then generate fixtures." : ""}
            </p>
          ) : (
            <div className="space-y-sm">
              {t.matches.map((m) => {
                const live = m.status === "LIVE" || m.status === "HALFTIME";
                return (
                  <div key={m.id} className="flex items-center justify-between gap-md p-sm rounded-lg border border-outline-variant">
                    <Link href={`/matches/${m.id}`} className="flex items-center gap-md flex-1 min-w-0 group">
                      <div className="flex items-center gap-sm flex-1 justify-end min-w-0">
                        <span className="font-label-md text-body-md truncate text-right group-hover:text-primary">{m.homeTeam.name}</span>
                        <Avatar src={m.homeTeam.logo} name={m.homeTeam.name} size={32} />
                      </div>
                      <div className="text-center shrink-0 w-16">
                        {live ? (
                          <span className="font-extrabold text-body-lg text-error flex items-center justify-center gap-1">
                            {m.homeScore}-{m.awayScore}
                          </span>
                        ) : m.status === "COMPLETED" ? (
                          <span className="font-extrabold text-body-lg">{m.homeScore} - {m.awayScore}</span>
                        ) : (
                          <Badge tone="neutral">{m.round ?? "TBD"}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-sm flex-1 min-w-0">
                        <Avatar src={m.awayTeam.logo} name={m.awayTeam.name} size={32} />
                        <span className="font-label-md text-body-md truncate group-hover:text-primary">{m.awayTeam.name}</span>
                      </div>
                    </Link>
                    {isOrganizer && (
                      <div className="shrink-0 flex items-center gap-xs">
                        <MatchResultForm matchId={m.id} home={m.homeScore} away={m.awayScore} path={`${path}?tab=fixtures`} />
                        <Link href={`/matches/${m.id}/control`} className="p-2 rounded-lg text-primary hover:bg-primary-container/10" title="Live control">
                          <Icon name="sports" size={20} />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "standings" && (
        <section className="bg-white rounded-xl border border-outline-variant p-lg overflow-x-auto">
          <h3 className="text-title-lg font-title-lg mb-md">Standings</h3>
          {sortedStandings.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No standings yet.</p>
          ) : (
            <table className="w-full text-body-md min-w-[560px]">
              <thead>
                <tr className="text-label-sm text-on-surface-variant uppercase border-b border-outline-variant">
                  <th className="text-left py-sm px-2">#</th>
                  <th className="text-left py-sm px-2">Team</th>
                  <th className="py-sm px-2">P</th>
                  <th className="py-sm px-2">W</th>
                  <th className="py-sm px-2">D</th>
                  <th className="py-sm px-2">L</th>
                  <th className="py-sm px-2">GF</th>
                  <th className="py-sm px-2">GA</th>
                  <th className="py-sm px-2">GD</th>
                  <th className="py-sm px-2 font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((s, i) => (
                  <tr key={s.id} className="border-b border-outline-variant/50 hover:bg-surface-container transition-colors">
                    <td className="py-sm px-2 text-on-surface-variant">{i + 1}</td>
                    <td className="py-sm px-2">
                      <Link href={`/teams/${s.team.slug}`} className="flex items-center gap-sm hover:text-primary">
                        <Avatar src={s.team.logo} name={s.team.name} size={28} />
                        <span className="font-label-md truncate">{s.team.name}</span>
                      </Link>
                    </td>
                    <td className="text-center px-2">{s.played}</td>
                    <td className="text-center px-2">{s.won}</td>
                    <td className="text-center px-2">{s.drawn}</td>
                    <td className="text-center px-2">{s.lost}</td>
                    <td className="text-center px-2">{s.goalsFor}</td>
                    <td className="text-center px-2">{s.goalsAgainst}</td>
                    <td className="text-center px-2">{s.goalsFor - s.goalsAgainst}</td>
                    <td className="text-center px-2 font-extrabold text-primary">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {tab === "awards" && (
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-title-lg font-title-lg flex items-center gap-xs">
              <Icon name="military_tech" className="text-secondary" filled /> Awards
            </h3>
            {isOrganizer && <ComputeAwardsButton tournamentId={t.id} path={`${path}?tab=awards`} />}
          </div>
          {t.awards.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">
              No awards yet.{isOrganizer ? " Log match events, then recompute awards." : " They appear automatically as matches are played."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {t.awards.map((a) => (
                <div key={a.id} className="rounded-xl border border-outline-variant p-md flex items-center gap-sm bg-surface-container-low">
                  <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                    <Icon name="emoji_events" filled />
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">{a.title}</p>
                    {a.player?.user ? (
                      <Link href={`/players/${a.player.user.username ?? a.player.user.id}`} className="font-title-lg text-body-lg truncate hover:text-primary block">
                        {a.player.user.name}
                      </Link>
                    ) : (
                      <p className="font-title-lg text-body-lg text-on-surface-variant">TBD</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-md flex items-center gap-sm">
      <div className="w-10 h-10 rounded-lg bg-white text-primary flex items-center justify-center shrink-0">
        <Icon name={icon} size={20} filled />
      </div>
      <div className="min-w-0">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wide">{label}</p>
        <p className="font-title-lg text-body-lg truncate">{value}</p>
      </div>
    </div>
  );
}
