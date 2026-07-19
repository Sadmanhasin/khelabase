"use client";

import { useTransition } from "react";
import { startConversation } from "@/lib/actions/chat";
import { Icon } from "@/components/ui/Icon";

export function MessageButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await startConversation(userId); })}
      className="bg-white border border-outline-variant px-md py-sm rounded-xl font-label-md flex items-center gap-xs hover:bg-surface-container-low disabled:opacity-60"
    >
      <Icon name="mail" size={18} /> Message
    </button>
  );
}
