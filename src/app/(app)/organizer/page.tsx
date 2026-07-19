import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Organizer" };

export default async function OrganizerHubPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/organizer");

  const organizers = await prisma.organizerProfile.findMany({
    where: { ownerId: userId },
    include: {
      tournaments: { orderBy: { createdAt: "desc" }, include: { _count: { select: { teams: true } } } },
    },
  });

  const allTournaments = organizers.flatMap((o) => o.tournaments);

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader
        title="Organizer"
        subtitle="Run professional tournaments."
        icon="shield"
        action={<Button href="/tournaments/create"><Icon name="add" size={20} /> New Tournament</Button>}
      />

      {allTournaments.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="emoji_events" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">You haven&apos;t created any tournaments</p>
          <p className="text-body-md text-on-surface-variant mt-xs">Create your first tournament to get started.</p>
          <Button href="/tournaments/create" className="mt-md">Create Tournament</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {allTournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.slug}/dashboard`} className="bg-white rounded-xl border border-outline-variant p-md premium-card-shadow hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-xs mb-xs">
                <Badge tone={t.status === "ONGOING" ? "success" : "primary"}>{t.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="font-title-lg text-body-lg truncate">{t.name}</p>
              <p className="text-label-md text-on-surface-variant">{t._count.teams} teams</p>
              <span className="text-primary font-bold text-label-md flex items-center gap-xs mt-sm">
                Open dashboard <Icon name="arrow_forward" size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
