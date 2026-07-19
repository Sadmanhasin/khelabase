import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

export const metadata = { title: "Teams" };

export default async function TeamsPage() {
  const userId = await getCurrentUserId();
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    take: 48,
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader
        title="Teams"
        subtitle="Squads competing across Bangladesh."
        icon="group"
        action={
          userId && (
            <Button href="/teams/create">
              <Icon name="add" size={20} /> Create Team
            </Button>
          )
        }
      />
      {teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="group_off" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No teams yet</p>
          <p className="text-body-md text-on-surface-variant mt-xs">Be the first to create a team.</p>
          {userId && (
            <Button href="/teams/create" className="mt-md">Create Team</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {teams.map((t) => (
            <Link key={t.id} href={`/teams/${t.slug}`} className="bg-white rounded-xl border border-outline-variant p-md flex items-center gap-sm premium-card-shadow hover:-translate-y-0.5 transition-all">
              <Avatar src={t.logo} name={t.name} size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-title-lg text-body-lg truncate flex items-center gap-xs">
                  {t.name}
                  {t.isVerified && <Icon name="verified" filled size={16} className="text-tertiary" />}
                </p>
                <p className="text-label-md text-on-surface-variant truncate">{t.district ?? "Bangladesh"}</p>
                <div className="flex items-center gap-xs mt-1">
                  <Badge tone="primary">{t.format.replace("F", "")}v{t.format.replace("F", "")}</Badge>
                  <Badge tone="neutral">{t._count.members} members</Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
