import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { positionLabel } from "@/lib/stats";
import { JoinTeamButton, JoinRequestActions } from "./JoinActions";
import { TeamRole } from "@prisma/client";

type Props = { params: Promise<{ slug: string }> };

async function getTeam(slug: string) {
  return prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { include: { playerProfile: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { homeMatches: true, awayMatches: true, tournamentEntries: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeam(slug);
  return { title: team?.name ?? "Team" };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const [team, viewerId] = await Promise.all([getTeam(slug), getCurrentUserId()]);
  if (!team) notFound();

  const path = `/teams/${slug}`;
  const active = team.members.filter((m) => m.status === "ACTIVE");
  const pending = team.members.filter((m) => m.status === "PENDING");
  const myMembership = team.members.find((m) => m.userId === viewerId);
  const MANAGER_ROLES: TeamRole[] = [TeamRole.OWNER, TeamRole.MANAGER];
  const canManage = myMembership && MANAGER_ROLES.includes(myMembership.role);

  return (
    <div className="max-w-container-max mx-auto px-md py-lg space-y-lg">
      <section className="bg-white rounded-xl border border-outline-variant premium-card-shadow overflow-hidden">
        <div className="h-36 md:h-48 bg-gradient-to-br from-primary to-primary-container relative">
          {team.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="px-lg pb-lg">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-14 gap-md">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-md">
              <div className="rounded-2xl border-4 border-white bg-white shadow-lg p-1">
                <Avatar src={team.logo} name={team.name} size={110} className="!rounded-xl" />
              </div>
              <div className="text-center md:text-left mb-xs">
                <div className="flex items-center justify-center md:justify-start gap-xs">
                  <h1 className="text-headline-lg font-extrabold">{team.name}</h1>
                  {team.isVerified && <Icon name="verified" filled className="text-tertiary" />}
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-xs mt-xs">
                  <Badge tone="primary">{team.format.replace("F", "")}v{team.format.replace("F", "")}</Badge>
                  <Badge tone="neutral">{team.type}</Badge>
                  <Badge tone="neutral"><Icon name="location_on" size={12} /> {team.district ?? "BD"}</Badge>
                  <Badge tone="neutral"><Icon name="group" size={12} /> {active.length} members</Badge>
                </div>
              </div>
            </div>
            <div className="mb-xs">
              {!myMembership && viewerId && <JoinTeamButton teamId={team.id} path={path} />}
              {myMembership?.status === "PENDING" && <Badge tone="gold">Request pending</Badge>}
              {canManage && (
                <Link href={`/teams/${slug}/manage`} className="bg-white border border-outline-variant px-lg py-sm rounded-xl font-label-md flex items-center gap-xs hover:bg-surface-container-low">
                  <Icon name="settings" size={18} /> Manage
                </Link>
              )}
            </div>
          </div>
          {team.description && <p className="text-body-md text-on-surface-variant mt-md max-w-2xl">{team.description}</p>}
        </div>
      </section>

      {canManage && pending.length > 0 && (
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md flex items-center gap-xs">
            <Icon name="how_to_reg" className="text-primary" /> Join Requests ({pending.length})
          </h3>
          <div className="divide-y divide-outline-variant">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-sm">
                <div className="flex items-center gap-sm">
                  <Avatar src={m.user.image} name={m.user.name} size={40} />
                  <div>
                    <p className="font-label-md text-body-md">{m.user.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{positionLabel(m.user.playerProfile?.preferredPosition)}</p>
                  </div>
                </div>
                <JoinRequestActions memberId={m.id} path={path} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <section className="lg:col-span-2 bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Squad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {active.map((m) => (
              <Link
                key={m.id}
                href={`/players/${m.user.username ?? m.user.id}`}
                className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container transition-colors"
              >
                <div className="relative">
                  <Avatar src={m.user.image} name={m.user.name} size={44} />
                  {m.jerseyNumber != null && (
                    <span className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {m.jerseyNumber}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-body-md truncate">{m.user.name}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {m.role === "PLAYER" ? positionLabel(m.user.playerProfile?.preferredPosition) : m.role}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-outline-variant p-lg h-fit">
          <h3 className="text-title-lg font-title-lg mb-md">Overview</h3>
          <dl className="space-y-sm">
            <Stat label="Members" value={active.length} />
            <Stat label="Tournaments" value={team._count.tournamentEntries} />
            <Stat label="Matches" value={team._count.homeMatches + team._count.awayMatches} />
            <Stat label="Founded" value={team.foundedDate ? team.foundedDate.getFullYear() : "—"} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body-md text-on-surface-variant">{label}</dt>
      <dd className="font-title-lg text-body-lg">{value}</dd>
    </div>
  );
}
