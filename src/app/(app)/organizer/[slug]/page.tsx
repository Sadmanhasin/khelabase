import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "@/components/FollowButton";

type Props = { params: Promise<{ slug: string }> };

async function getOrganizer(slug: string) {
  return prisma.organizerProfile.findUnique({
    where: { slug },
    include: {
      tournaments: { orderBy: { createdAt: "desc" }, include: { _count: { select: { teams: true } } } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const o = await getOrganizer(slug);
  return { title: o?.name ?? "Organizer" };
}

export default async function OrganizerProfilePage({ params }: Props) {
  const { slug } = await params;
  const [o, viewerId] = await Promise.all([getOrganizer(slug), getCurrentUserId()]);
  if (!o) notFound();

  const following = viewerId
    ? await prisma.follow.findUnique({
        where: { followerId_targetType_targetId: { followerId: viewerId, targetType: "ORGANIZER", targetId: o.id } },
      })
    : null;

  const upcoming = o.tournaments.filter((t) => ["REGISTRATION_OPEN", "ONGOING"].includes(t.status));
  const past = o.tournaments.filter((t) => t.status === "COMPLETED");

  return (
    <div className="max-w-container-max mx-auto px-md py-lg space-y-lg">
      <section className="bg-white rounded-xl border border-outline-variant premium-card-shadow overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-tertiary to-primary" />
        <div className="px-lg pb-lg">
          <div className="flex items-end justify-between -mt-12 gap-md flex-wrap">
            <div className="flex items-end gap-md">
              <div className="rounded-2xl border-4 border-white bg-white shadow-lg p-1">
                <Avatar src={o.logo} name={o.name} size={96} className="!rounded-xl" />
              </div>
              <div className="mb-xs">
                <div className="flex items-center gap-xs">
                  <h1 className="text-headline-md font-extrabold">{o.name}</h1>
                  {o.isVerified && <Icon name="verified" filled className="text-tertiary" />}
                </div>
                <p className="text-body-md text-on-surface-variant flex items-center gap-1">
                  <Icon name="location_on" size={16} /> {o.district ?? "Bangladesh"}
                </p>
              </div>
            </div>
            {viewerId && (
              <div className="mb-xs">
                <FollowButton targetType="ORGANIZER" targetId={o.id} initialFollowing={!!following} path={`/organizer/${slug}`} />
              </div>
            )}
          </div>
          {o.description && <p className="text-body-md text-on-surface-variant mt-md max-w-2xl">{o.description}</p>}
        </div>
      </section>

      <OrganizerSection title="Active & Upcoming Tournaments" tournaments={upcoming} empty="No active tournaments." />
      {past.length > 0 && <OrganizerSection title="Past Tournaments" tournaments={past} empty="" />}
    </div>
  );
}

function OrganizerSection({
  title,
  tournaments,
  empty,
}: {
  title: string;
  tournaments: { id: string; name: string; slug: string; status: string; _count: { teams: number } }[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="text-headline-md font-bold mb-md">{title}</h2>
      {tournaments.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">{empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.slug}`} className="bg-white rounded-xl border border-outline-variant p-md hover:-translate-y-0.5 transition-all premium-card-shadow">
              <Badge tone={t.status === "ONGOING" ? "success" : "primary"}>{t.status.replace(/_/g, " ")}</Badge>
              <p className="font-title-lg text-body-lg truncate mt-xs">{t.name}</p>
              <p className="text-label-md text-on-surface-variant">{t._count.teams} teams</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
