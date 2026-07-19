import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/messages");

  const parts = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { select: { id: true, name: true, username: true, image: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const convos = parts.filter((p) => p.conversation.messages.length > 0 || p.conversation.participants.length > 1);

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title="Messages" subtitle="Chat with players, teams and organizers." icon="chat" />
      {convos.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="forum" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No conversations yet</p>
          <p className="text-body-md text-on-surface-variant mt-xs">Message a player from their profile to start chatting.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
          {convos.map((p) => {
            const other = p.conversation.participants.find((pp) => pp.user.id !== userId)?.user;
            const last = p.conversation.messages[0];
            const unread = last && (!p.lastReadAt || last.createdAt > p.lastReadAt) && last.senderId !== userId;
            return (
              <Link key={p.id} href={`/messages/${p.conversationId}`} className="flex items-center gap-sm p-md hover:bg-surface-container transition-colors">
                <Avatar src={other?.image} name={other?.name} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-sm">
                    <p className="font-label-md text-body-md truncate">{other?.name ?? "Conversation"}</p>
                    {last && <span className="text-label-sm text-on-surface-variant shrink-0">{timeAgo(last.createdAt)}</span>}
                  </div>
                  <p className={`text-body-md truncate ${unread ? "text-on-surface font-bold" : "text-on-surface-variant"}`}>
                    {last ? last.content : "Say hello 👋"}
                  </p>
                </div>
                {unread && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
