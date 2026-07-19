"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/lib/actions/chat";
import { Icon } from "@/components/ui/Icon";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setValue("");
    startTransition(async () => {
      await sendMessage(conversationId, text);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-sm p-md border-t border-outline-variant bg-white">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 rounded-full border border-outline-variant bg-surface-container-low px-md py-sm text-body-md focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending || !value.trim()}
        className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
      >
        <Icon name="send" size={20} />
      </button>
    </form>
  );
}
