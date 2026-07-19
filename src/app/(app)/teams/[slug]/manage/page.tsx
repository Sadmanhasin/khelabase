import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { ManageRoster } from "./ManageRoster";
import { TeamRole } from "@prisma/client";

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: "Manage Team" };

export default async function ManageTeamPage({ params }: Props) {
  const { slug } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?callbackUrl=/teams/${slug}/manage`);

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { include: { playerProfile: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!team) notFound();

  const me = team.members.find((m) => m.userId === userId);
  const managerRoles: TeamRole[] = [TeamRole.OWNER, TeamRole.MANAGER];
  if (!me || !managerRoles.includes(me.role)) {
    return (
      <div className="px-md py-lg max-w-2xl mx-auto text-center">
        <Icon name="lock" size={48} className="text-outline-variant" />
        <p className="font-title-lg text-title-lg mt-md">You can&apos;t manage this team</p>
        <Link href={`/teams/${slug}`} className="text-primary font-bold mt-sm inline-block">Back to team</Link>
      </div>
    );
  }

  return (
    <div className="px-md py-lg max-w-3xl mx-auto">
      <PageHeader
        title={`Manage ${team.name}`}
        subtitle="Roster, roles and jersey numbers."
        icon="manage_accounts"
        action={
          <Link href={`/teams/${slug}`} className="text-primary font-bold text-label-md flex items-center gap-xs">
            <Icon name="arrow_back" size={18} /> Back
          </Link>
        }
      />
      <ManageRoster
        path={`/teams/${slug}/manage`}
        isOwner={me.role === TeamRole.OWNER}
        members={team.members
          .filter((m) => m.status === "ACTIVE")
          .map((m) => ({
            id: m.id,
            name: m.user.name ?? "Player",
            image: m.user.image,
            role: m.role,
            jerseyNumber: m.jerseyNumber,
          }))}
      />
    </div>
  );
}
