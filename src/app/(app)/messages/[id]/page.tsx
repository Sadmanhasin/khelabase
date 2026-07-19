import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { markConversationRead } from "@/lib/actions/chat";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { MessageComposer } from "./MessageComposer";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect(`/login?callbackUrl=/messages/${id}`);

  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { select: { id: true, name: true, username: true, image: true } } } },
      messages: { orderBy: { createdAt: "asc" }, take: 200, include: { sender: { select: { id: true, name: true, image: true } } } },
    },
  });
  if (!convo) notFound();
  if (!convo.participants.some((p) => p.user.id === userId)) redirect("/messages");

  await markConversationRead(id);

  const other = convo.participants.find((p) => p.user.id !== userId)?.user;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center gap-sm p-md border-b border-outline-variant bg-white">
        <Link href="/messages" className="p-1 rounded-lg hover:bg-surface-container lg:hidden">
          <Icon name="arrow_back" />
        </Link>
        <Avatar src={other?.image} name={other?.name} size={40} />
        <div>
          <Link href={other?.username ? `/players/${other.username}` : "#"} className="font-title-lg text-body-lg hover:text-primary">
            {other?.name ?? "Conversation"}
          </Link>
          <p className="text-label-sm text-on-surface-variant">Active recently</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-md space-y-sm scrollbar-thin bg-surface">
        {convo.messages.length === 0 && (
          <p className="text-center text-body-md text-on-surface-variant mt-lg">No messages yet. Say hello 👋</p>
        )}
        {convo.messages.map((m) => {
          const mine = m.sender.id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-md py-sm rounded-2xl text-body-md ${
                  mine
                    ? "bg-primary text-on-primary rounded-br-sm"
                    : "bg-white border border-outline-variant rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <MessageComposer conversationId={id} />
    </div>
  );
}
