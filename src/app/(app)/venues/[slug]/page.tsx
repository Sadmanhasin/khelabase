import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

type Props = { params: Promise<{ slug: string }> };

async function getVenue(slug: string) {
  return prisma.venue.findUnique({
    where: { slug },
    include: {
      matches: {
        orderBy: { kickoff: "desc" },
        take: 8,
        include: { homeTeam: true, awayTeam: true },
      },
      tournaments: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVenue(slug);
  return { title: v?.name ?? "Venue" };
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const v = await getVenue(slug);
  if (!v) notFound();

  return (
    <div className="max-w-container-max mx-auto px-md py-lg space-y-lg">
      <section className="bg-white rounded-xl border border-outline-variant premium-card-shadow overflow-hidden">
        <div className="h-40 md:h-52 bg-gradient-to-br from-primary-container to-primary relative flex items-center justify-center">
          {v.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <Icon name="stadium" size={64} className="text-white/80" filled />
          )}
        </div>
        <div className="p-lg">
          <h1 className="text-headline-lg font-extrabold">{v.name}</h1>
          <div className="flex flex-wrap items-center gap-sm mt-xs text-body-md text-on-surface-variant">
            <span className="flex items-center gap-1"><Icon name="location_on" size={16} /> {v.address ?? v.district ?? "Bangladesh"}</span>
            {(v.rating ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-secondary font-bold"><Icon name="star" size={16} filled /> {v.rating?.toFixed(1)}</span>
            )}
            {v.formats.map((f) => (
              <Badge key={f} tone="primary">{f.replace("F", "")}v{f.replace("F", "")}</Badge>
            ))}
          </div>
          {v.description && <p className="text-body-md text-on-surface-variant mt-md max-w-2xl">{v.description}</p>}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Recent & Upcoming Matches</h3>
          {v.matches.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No matches hosted yet.</p>
          ) : (
            <div className="space-y-sm">
              {v.matches.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-sm p-sm rounded-lg border border-outline-variant">
                  <div className="flex items-center gap-xs flex-1 justify-end min-w-0">
                    <span className="text-label-md truncate text-right">{m.homeTeam.name}</span>
                    <Avatar src={m.homeTeam.logo} name={m.homeTeam.name} size={28} />
                  </div>
                  <span className="font-bold shrink-0">
                    {m.status === "COMPLETED" ? `${m.homeScore}-${m.awayScore}` : "vs"}
                  </span>
                  <div className="flex items-center gap-xs flex-1 min-w-0">
                    <Avatar src={m.awayTeam.logo} name={m.awayTeam.name} size={28} />
                    <span className="text-label-md truncate">{m.awayTeam.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Hosted Tournaments</h3>
          {v.tournaments.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No tournaments hosted yet.</p>
          ) : (
            <div className="space-y-sm">
              {v.tournaments.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.slug}`} className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center">
                    <Icon name="emoji_events" filled size={20} />
                  </div>
                  <span className="font-label-md text-body-md truncate">{t.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
