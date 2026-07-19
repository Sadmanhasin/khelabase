import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { positionLabel } from "@/lib/stats";
import { BD_DISTRICTS } from "@/lib/utils";

export const metadata = { title: "Players" };

type Props = { searchParams: Promise<{ district?: string; lft?: string }> };

export default async function PlayersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const players = await prisma.user.findMany({
    where: {
      playerProfile: { isNot: null },
      ...(sp.district ? { district: sp.district } : {}),
      ...(sp.lft ? { playerProfile: { lookingForTeam: true } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 48,
    include: { playerProfile: { include: { currentTeam: true } } },
  });

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader title="Players" subtitle="Discover footballers across Bangladesh." icon="sports_soccer" />

      <div className="flex flex-wrap gap-xs mb-lg">
        <FilterChip href="/players" active={!sp.district && !sp.lft} label="All" />
        <FilterChip href="/players?lft=1" active={!!sp.lft} label="Looking for team" />
        {BD_DISTRICTS.slice(0, 8).map((d) => (
          <FilterChip key={d} href={`/players?district=${encodeURIComponent(d)}`} active={sp.district === d} label={d} />
        ))}
      </div>

      {players.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">No players found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.username ?? p.id}`}
              className="bg-white rounded-xl border border-outline-variant p-md premium-card-shadow hover:-translate-y-0.5 transition-all flex items-center gap-sm"
            >
              <Avatar src={p.image} name={p.name} size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-title-lg text-body-lg truncate flex items-center gap-xs">
                  {p.name}
                  {p.isVerified && <Icon name="verified" filled size={16} className="text-tertiary" />}
                </p>
                <p className="text-label-md text-on-surface-variant truncate">
                  {positionLabel(p.playerProfile?.preferredPosition)}
                  {p.playerProfile?.currentTeam ? ` • ${p.playerProfile.currentTeam.name}` : ""}
                </p>
                <div className="flex items-center gap-xs mt-1">
                  <Badge tone="neutral"><Icon name="location_on" size={12} /> {p.district ?? "BD"}</Badge>
                  {p.playerProfile?.lookingForTeam && <Badge tone="gold">LFT</Badge>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-md py-1.5 rounded-full text-label-md border transition-all ${
        active ? "bg-primary text-on-primary border-primary" : "bg-white border-outline-variant hover:border-primary"
      }`}
    >
      {label}
    </Link>
  );
}
