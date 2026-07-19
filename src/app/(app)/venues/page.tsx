import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Venues" };

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { rating: "desc" },
    take: 48,
    include: { _count: { select: { matches: true, tournaments: true } } },
  });

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader title="Venues" subtitle="Football turfs and grounds across Bangladesh." icon="stadium" />
      {venues.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="stadium" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No venues yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {venues.map((v) => (
            <Link key={v.id} href={`/venues/${v.slug}`} className="bg-white rounded-xl border border-outline-variant overflow-hidden premium-card-shadow hover:-translate-y-0.5 transition-all">
              <div className="h-28 bg-gradient-to-br from-primary-container to-primary relative flex items-center justify-center">
                {v.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.coverImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="stadium" size={40} className="text-white/80" filled />
                )}
              </div>
              <div className="p-md">
                <p className="font-title-lg text-body-lg truncate">{v.name}</p>
                <p className="text-label-md text-on-surface-variant flex items-center gap-1">
                  <Icon name="location_on" size={14} /> {v.district ?? "Bangladesh"}
                </p>
                <div className="flex items-center gap-md mt-sm text-label-sm text-on-surface-variant">
                  {(v.rating ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-secondary font-bold"><Icon name="star" size={14} filled /> {v.rating?.toFixed(1)}</span>
                  )}
                  <span className="flex items-center gap-1"><Icon name="sports_soccer" size={14} /> {v._count.matches}</span>
                  {v.formats.length > 0 && <Badge tone="neutral">{v.formats.map((f) => f.replace("F", "")).join("/")}</Badge>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
