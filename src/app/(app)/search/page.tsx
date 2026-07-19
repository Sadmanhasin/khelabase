import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Search" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <div className="px-md py-lg max-w-2xl mx-auto">
        <PageHeader title="Search" icon="search" />
        <p className="text-body-md text-on-surface-variant">Type a name to search players, teams and tournaments.</p>
      </div>
    );
  }

  const [players, teams, tournaments] = await Promise.all([
    prisma.user.findMany({
      where: { playerProfile: { isNot: null }, name: { contains: query, mode: "insensitive" } },
      take: 10,
      include: { playerProfile: true },
    }),
    prisma.team.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10 }),
    prisma.tournament.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 10 }),
  ]);

  const total = players.length + teams.length + tournaments.length;

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title={`Results for “${query}”`} subtitle={`${total} result${total === 1 ? "" : "s"}`} icon="search" />

      {total === 0 && <p className="text-body-md text-on-surface-variant">No matches found.</p>}

      {players.length > 0 && (
        <ResultGroup title="Players">
          {players.map((p) => (
            <Row key={p.id} href={`/players/${p.username ?? p.id}`} image={p.image} name={p.name} sub="Player" />
          ))}
        </ResultGroup>
      )}
      {teams.length > 0 && (
        <ResultGroup title="Teams">
          {teams.map((t) => (
            <Row key={t.id} href={`/teams/${t.slug}`} image={t.logo} name={t.name} sub={t.district ?? "Team"} />
          ))}
        </ResultGroup>
      )}
      {tournaments.length > 0 && (
        <ResultGroup title="Tournaments">
          {tournaments.map((t) => (
            <Row key={t.id} href={`/tournaments/${t.slug}`} icon="emoji_events" name={t.name} sub={t.status.replace("_", " ")} />
          ))}
        </ResultGroup>
      )}
    </div>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-lg">
      <h2 className="font-label-md text-label-md uppercase tracking-wide text-on-surface-variant mb-sm">{title}</h2>
      <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ href, image, icon, name, sub }: { href: string; image?: string | null; icon?: string; name: string | null; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-sm p-md hover:bg-surface-container transition-colors">
      {icon ? (
        <div className="w-10 h-10 rounded-full bg-primary-container/15 text-primary flex items-center justify-center">
          <Icon name={icon} filled size={20} />
        </div>
      ) : (
        <Avatar src={image} name={name} size={40} />
      )}
      <div className="min-w-0">
        <p className="font-label-md text-body-md truncate">{name}</p>
        <p className="text-label-sm text-on-surface-variant capitalize">{sub.toLowerCase()}</p>
      </div>
    </Link>
  );
}
