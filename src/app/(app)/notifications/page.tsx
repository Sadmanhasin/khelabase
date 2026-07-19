import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const metadata = { title: "Notifications" };

const ICON: Record<string, string> = {
  FOLLOW: "person_add",
  TEAM_INVITE: "group_add",
  JOIN_REQUEST: "how_to_reg",
  TOURNAMENT: "emoji_events",
  MATCH: "sports_soccer",
  AWARD: "military_tech",
  TRANSFER: "swap_horiz",
  CHAT: "chat",
  MARKETPLACE: "shopping_bag",
  SYSTEM: "notifications",
};

export default async function NotificationsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/notifications");

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: { select: { name: true, image: true } } },
  });

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader
        title="Notifications"
        icon="notifications"
        action={<MarkAllReadButton />}
      />
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="notifications_off" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No notifications yet</p>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Follows, invites and match updates will show up here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
          {items.map((n) => {
            const inner = (
              <div
                className={`flex items-start gap-sm p-md transition-colors hover:bg-surface-container ${
                  n.isRead ? "" : "bg-primary-container/5"
                }`}
              >
                {n.actor ? (
                  <Avatar src={n.actor.image} name={n.actor.name} size={40} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
                    <Icon name={ICON[n.type] ?? "notifications"} filled size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-body-md">{n.title}</p>
                  {n.body && <p className="text-body-md text-on-surface-variant">{n.body}</p>}
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
