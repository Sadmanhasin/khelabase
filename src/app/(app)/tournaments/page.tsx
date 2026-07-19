import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Prisma } from "@prisma/client";

export const metadata = { title: "Tournaments" };

const STATUS_TONE: Record<string, "success" | "primary" | "neutral"> = {
  ONGOING: "success",
  REGISTRATION_OPEN: "primary",
  COMPLETED: "neutral",
};

type Props = { searchParams: Promise<{ status?: string; format?: string }> };

export default async function TournamentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const userId = await getCurrentUserId();

  const where: Prisma.TournamentWhereInput = { visibility: "PUBLIC" };
  if (sp.status) where.status = sp.status as never;
  if (sp.format) where.format = sp.format as never;

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 48,
    include: { organizer: true, venue: true, _count: { select: { teams: true } } },
  });

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader
        title="Tournaments"
        subtitle="Compete in leagues and knockouts across Bangladesh."
        icon="emoji_events"
        action={userId && <Button href="/tournaments/create"><Icon name="add" size={20} /> Create Tournament</Button>}
      />

      <div className="flex flex-wrap gap-xs mb-lg">
        <Chip href="/tournaments" active={!sp.status} label="All" />
        <Chip href="/tournaments?status=REGISTRATION_OPEN" active={sp.status === "REGISTRATION_OPEN"} label="Open Registration" />
        <Chip href="/tournaments?status=ONGOING" active={sp.status === "ONGOING"} label="Ongoing" />
        <Chip href="/tournaments?status=COMPLETED" active={sp.status === "COMPLETED"} label="Completed" />
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="emoji_events" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No tournaments yet</p>
          {userId && <Button href="/tournaments/create" className="mt-md">Create the first one</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.slug}`} className="bg-white rounded-xl border border-outline-variant overflow-hidden premium-card-shadow hover:-translate-y-0.5 transition-all">
              <div className="h-28 bg-gradient-to-br from-primary to-primary-container relative flex items-center justify-center">
                {t.banner ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.banner} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="emoji_events" size={40} className="text-white/80" filled />
                )}
              </div>
              <div className="p-md">
                <div className="flex items-center gap-xs mb-1 flex-wrap">
                  <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status.replace(/_/g, " ")}</Badge>
                  <Badge tone="neutral">{t.type.replace(/_/g, " ")}</Badge>
                </div>
                <p className="font-title-lg text-body-lg truncate">{t.name}</p>
                <p className="text-label-md text-on-surface-variant truncate">{t.organizer.name}</p>
                <div className="flex items-center gap-md mt-sm text-label-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><Icon name="group" size={14} /> {t._count.teams}</span>
                  <span className="flex items-center gap-1"><Icon name="location_on" size={14} /> {t.location ?? "BD"}</span>
                  {(t.prizeMoney ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-secondary font-bold"><Icon name="paid" size={14} /> ৳{t.prizeMoney?.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`px-md py-1.5 rounded-full text-label-md border transition-all ${active ? "bg-primary text-on-primary border-primary" : "bg-white border-outline-variant hover:border-primary"}`}>
      {label}
    </Link>
  );
}
