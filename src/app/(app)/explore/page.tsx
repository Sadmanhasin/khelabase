import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Explore" };

const CATEGORIES = [
  { icon: "sports_soccer", label: "Players", href: "/players", tone: "bg-primary-container/15 text-primary" },
  { icon: "group", label: "Teams", href: "/teams", tone: "bg-secondary-container/40 text-on-secondary-container" },
  { icon: "emoji_events", label: "Tournaments", href: "/tournaments", tone: "bg-tertiary-container/20 text-tertiary" },
  { icon: "stadium", label: "Venues", href: "/venues", tone: "bg-surface-container-high text-primary" },
];

export default async function ExplorePage() {
  const [teams, tournaments, players] = await Promise.all([
    prisma.team.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { _count: { select: { members: true } } } }),
    prisma.tournament.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { organizer: true, _count: { select: { teams: true } } },
    }),
    prisma.user.findMany({ where: { playerProfile: { isNot: null } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return (
    <div className="px-md py-lg max-w-container-max mx-auto space-y-xl">
      <PageHeader title="Explore" subtitle="Discover the football community." icon="explore" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {CATEGORIES.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white rounded-xl border border-outline-variant p-lg flex flex-col items-center gap-sm hover:-translate-y-0.5 transition-all premium-card-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${c.tone}`}>
              <Icon name={c.icon} size={30} filled />
            </div>
            <span className="font-title-lg text-body-lg">{c.label}</span>
          </Link>
        ))}
      </div>

      <Section title="Latest Tournaments" href="/tournaments">
        {tournaments.length === 0 ? (
          <Empty label="No tournaments yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {tournaments.map((t) => (
              <Link key={t.id} href={`/tournaments/${t.slug}`} className="bg-white rounded-xl border border-outline-variant overflow-hidden hover:-translate-y-0.5 transition-all premium-card-shadow">
                <div className="h-24 bg-gradient-to-br from-primary to-primary-container relative">
                  {t.banner && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.banner} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-md">
                  <div className="flex items-center gap-xs mb-1">
                    <Badge tone={t.status === "ONGOING" ? "success" : "primary"}>{t.status.replace("_", " ")}</Badge>
                    <Badge tone="neutral">{t.format.replace("F", "")}v{t.format.replace("F", "")}</Badge>
                  </div>
                  <p className="font-title-lg text-body-lg truncate">{t.name}</p>
                  <p className="text-label-md text-on-surface-variant truncate">{t.organizer.name} • {t._count.teams} teams</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="New Teams" href="/teams">
        {teams.length === 0 ? (
          <Empty label="No teams yet." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {teams.map((t) => (
              <Link key={t.id} href={`/teams/${t.slug}`} className="bg-white rounded-xl border border-outline-variant p-md flex items-center gap-sm hover:-translate-y-0.5 transition-all premium-card-shadow">
                <Avatar src={t.logo} name={t.name} size={48} />
                <div className="min-w-0">
                  <p className="font-title-lg text-body-lg truncate">{t.name}</p>
                  <p className="text-label-md text-on-surface-variant">{t._count.members} members • {t.district ?? "BD"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="New Players" href="/players">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
          {players.map((p) => (
            <Link key={p.id} href={`/players/${p.username ?? p.id}`} className="bg-white rounded-xl border border-outline-variant p-md flex flex-col items-center text-center gap-xs hover:-translate-y-0.5 transition-all">
              <Avatar src={p.image} name={p.name} size={56} />
              <p className="font-label-md text-body-md truncate w-full">{p.name}</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-md">
        <h2 className="text-headline-md font-bold">{title}</h2>
        <Link href={href} className="text-primary font-bold text-label-md hover:underline flex items-center gap-xs">
          View all <Icon name="chevron_right" size={18} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-body-md text-on-surface-variant">{label}</p>;
}
