import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: "Organizer Dashboard" };

export default async function TournamentDashboard({ params }: Props) {
  const { slug } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?callbackUrl=/tournaments/${slug}/dashboard`);

  const t = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      organizer: true,
      _count: { select: { teams: true, matches: true } },
      teams: { where: { status: "PENDING" }, select: { id: true } },
    },
  });
  if (!t) notFound();
  if (t.organizer.ownerId !== userId) redirect(`/tournaments/${slug}`);

  const completed = await prisma.match.count({ where: { tournamentId: t.id, status: "COMPLETED" } });

  const cards = [
    { icon: "group", label: "Teams", value: t._count.teams, href: `/tournaments/${slug}?tab=teams` },
    { icon: "how_to_reg", label: "Pending Requests", value: t.teams.length, href: `/tournaments/${slug}?tab=teams` },
    { icon: "sports_soccer", label: "Fixtures", value: t._count.matches, href: `/tournaments/${slug}?tab=fixtures` },
    { icon: "check_circle", label: "Played", value: completed, href: `/tournaments/${slug}?tab=fixtures` },
  ];

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader
        title={t.name}
        subtitle="Organizer dashboard"
        icon="dashboard"
        action={
          <Link href={`/tournaments/${slug}`} className="text-primary font-bold text-label-md flex items-center gap-xs">
            <Icon name="visibility" size={18} /> View public page
          </Link>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white rounded-xl border border-outline-variant p-lg premium-card-shadow hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center mb-sm">
              <Icon name={c.icon} filled />
            </div>
            <p className="text-headline-md font-extrabold">{c.value}</p>
            <p className="text-label-md text-on-surface-variant">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <QuickAction icon="how_to_reg" title="Manage Teams" desc="Approve or reject registrations." href={`/tournaments/${slug}?tab=teams`} />
        <QuickAction icon="auto_awesome" title="Fixtures & Results" desc="Generate fixtures and record scores." href={`/tournaments/${slug}?tab=fixtures`} />
        <QuickAction icon="leaderboard" title="Standings" desc="View the live league table." href={`/tournaments/${slug}?tab=standings`} />
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, href }: { icon: string; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-outline-variant p-lg hover:border-primary transition-colors">
      <div className="flex items-center gap-sm mb-xs">
        <Icon name={icon} className="text-primary" />
        <h3 className="font-title-lg text-body-lg">{title}</h3>
      </div>
      <p className="text-body-md text-on-surface-variant">{desc}</p>
    </Link>
  );
}
