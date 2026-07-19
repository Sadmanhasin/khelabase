import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { getPlayerCareerStats, positionLabel } from "@/lib/stats";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "@/components/FollowButton";
import { MessageButton } from "@/components/MessageButton";
import { timeAgo } from "@/lib/utils";

type Props = { params: Promise<{ username: string }> };

async function getUser(username: string) {
  return prisma.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
    include: {
      playerProfile: { include: { currentTeam: true, awards: true } },
      teamMemberships: { where: { status: "ACTIVE" }, include: { team: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  return { title: user?.name ?? "Player" };
}

export default async function PlayerProfilePage({ params }: Props) {
  const { username } = await params;
  const [user, viewerId] = await Promise.all([getUser(username), getCurrentUserId()]);
  if (!user) notFound();

  const isSelf = viewerId === user.id;
  const [stats, followerCount, following, achievements] = await Promise.all([
    user.playerProfile ? getPlayerCareerStats(user.playerProfile.id) : null,
    prisma.follow.count({ where: { targetType: "USER", targetId: user.id } }),
    viewerId
      ? prisma.follow.findUnique({
          where: {
            followerId_targetType_targetId: {
              followerId: viewerId,
              targetType: "USER",
              targetId: user.id,
            },
          },
        })
      : null,
    user.playerProfile
      ? prisma.achievement.findMany({
          where: { playerId: user.playerProfile.id },
          orderBy: { occurredAt: "desc" },
          take: 8,
        })
      : [],
  ]);

  const pp = user.playerProfile;
  const statItems = [
    { label: "Matches", value: stats?.matches ?? 0, tone: "text-primary" },
    { label: "Goals", value: stats?.goals ?? 0, tone: "text-primary" },
    { label: "Assists", value: stats?.assists ?? 0, tone: "text-primary" },
    { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, tone: "text-primary" },
    { label: "MOTM", value: stats?.motm ?? 0, tone: "text-secondary" },
  ];

  return (
    <div className="max-w-container-max mx-auto px-md py-lg space-y-lg">
      {/* Header card */}
      <section className="bg-white rounded-xl border border-outline-variant premium-card-shadow overflow-hidden">
        <div className="h-40 md:h-56 relative bg-gradient-to-br from-primary to-primary-container">
          {user.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.coverImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        <div className="px-lg pb-lg">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-16 md:-mt-20 gap-md">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-md">
              <div className="rounded-full border-4 border-white bg-white shadow-lg">
                <Avatar src={user.image} name={user.name} size={140} className="!rounded-full" />
              </div>
              <div className="text-center md:text-left mb-xs">
                <div className="flex items-center justify-center md:justify-start gap-xs">
                  <h1 className="text-headline-lg font-extrabold">{user.name}</h1>
                  {user.isVerified && <Icon name="verified" filled className="text-tertiary" />}
                </div>
                <p className="text-body-lg text-on-surface-variant">
                  {positionLabel(pp?.preferredPosition)}
                  {pp?.currentTeam ? ` • ${pp.currentTeam.name}` : ""}
                  {pp?.jerseyNumber != null ? ` • #${pp.jerseyNumber}` : ""}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-sm mt-xs">
                  <Chip icon="location_on">{user.district ?? "Bangladesh"}</Chip>
                  {pp?.preferredFoot && (
                    <Chip icon="footprint">{pp.preferredFoot === "BOTH" ? "Both feet" : `${pp.preferredFoot[0]}${pp.preferredFoot.slice(1).toLowerCase()} footed`}</Chip>
                  )}
                  <Chip icon="group">{followerCount} followers</Chip>
                  {pp?.lookingForTeam && <Badge tone="gold"><Icon name="search" size={12} /> Looking for team</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-sm mb-xs">
              {isSelf ? (
                <Link
                  href="/settings"
                  className="bg-white border border-outline-variant px-lg py-sm rounded-xl font-label-md flex items-center gap-xs hover:bg-surface-container-low"
                >
                  <Icon name="edit" size={18} /> Edit Profile
                </Link>
              ) : (
                <>
                  <FollowButton targetType="USER" targetId={user.id} initialFollowing={!!following} path={`/players/${username}`} />
                  {viewerId && <MessageButton userId={user.id} />}
                </>
              )}
            </div>
          </div>
          {user.bio && <p className="text-body-md text-on-surface-variant mt-md max-w-2xl">{user.bio}</p>}
        </div>
      </section>

      {/* Stat grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-md">
        {statItems.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-outline-variant p-md flex flex-col items-center text-center">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</span>
            <span className={`text-headline-md font-extrabold ${s.tone}`}>{s.value}</span>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Football info */}
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Football Information</h3>
          <dl className="space-y-sm">
            <Info label="Preferred Position" value={positionLabel(pp?.preferredPosition)} />
            <Info label="Secondary Position" value={pp?.secondaryPosition ? positionLabel(pp.secondaryPosition) : "—"} />
            <Info label="Preferred Foot" value={pp?.preferredFoot ?? "—"} />
            <Info label="Height" value={pp?.heightCm ? `${pp.heightCm} cm` : "—"} />
            <Info label="Experience" value={pp?.experienceLevel ?? "—"} />
            <Info label="Playing Style" value={pp?.playingStyle ?? "—"} />
          </dl>
        </section>

        {/* Discipline / detailed stats */}
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Career Detail</h3>
          <dl className="space-y-sm">
            <Info label="Minutes Played" value={String(stats?.minutes ?? 0)} />
            <Info label="Clean Sheets" value={String(stats?.cleanSheets ?? 0)} />
            <Info label="Yellow Cards" value={String(stats?.yellowCards ?? 0)} />
            <Info label="Red Cards" value={String(stats?.redCards ?? 0)} />
            <Info label="Teams" value={String(user.teamMemberships.length)} />
            <Info label="Joined" value={timeAgo(user.createdAt)} />
          </dl>
        </section>

        {/* Achievements */}
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md flex items-center gap-xs">
            <Icon name="military_tech" className="text-secondary" filled /> Achievements
          </h3>
          {achievements.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No achievements yet. They appear automatically as this player competes.</p>
          ) : (
            <ul className="space-y-sm">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                    <Icon name={a.icon ?? "emoji_events"} size={18} filled />
                  </div>
                  <div>
                    <p className="font-label-md text-body-md">{a.title}</p>
                    {a.detail && <p className="text-label-sm text-on-surface-variant">{a.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Teams */}
      {user.teamMemberships.length > 0 && (
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Teams</h3>
          <div className="flex flex-wrap gap-sm">
            {user.teamMemberships.map((m) => (
              <Link
                key={m.id}
                href={`/teams/${m.team.slug}`}
                className="flex items-center gap-sm border border-outline-variant rounded-xl px-md py-sm hover:border-primary transition-colors"
              >
                <Avatar src={m.team.logo} name={m.team.name} size={32} />
                <div>
                  <p className="font-label-md text-body-md">{m.team.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{m.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Chip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-xs px-sm py-1 bg-surface-container-low rounded-full text-label-sm text-on-surface-variant">
      <Icon name={icon} size={14} /> {children}
    </span>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-md">
      <dt className="text-body-md text-on-surface-variant">{label}</dt>
      <dd className="font-label-md text-body-md text-right capitalize">{value.toLowerCase()}</dd>
    </div>
  );
}
