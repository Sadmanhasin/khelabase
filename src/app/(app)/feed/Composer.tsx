"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/actions/posts";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

const TAGS = [
  { icon: "image", label: "Photo", type: "PHOTO" },
  { icon: "videocam", label: "Video", type: "VIDEO" },
  { icon: "military_tech", label: "Achievement", type: "ACHIEVEMENT" },
  { icon: "scoreboard", label: "Result", type: "MATCH_RESULT" },
];

export function Composer({ user }: { user: { name?: string | null; image?: string | null } }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [type, setType] = useState("TEXT");
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  function submit() {
    if (!content.trim()) return;
    const fd = new FormData();
    fd.set("content", content);
    fd.set("type", type);
    startTransition(async () => {
      const res = await createPost(fd);
      if (res.ok) {
        setContent("");
        setType("TEXT");
        router.refresh();
      }
    });
  }

  return (
    <section className="bg-white rounded-xl border border-outline-variant p-md shadow-sm mb-lg">
      <div className="flex gap-md">
        <Avatar src={user.image} name={user.name} size={48} />
        <textarea
          ref={ref}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border-none focus:ring-0 text-body-lg resize-none p-0 bg-transparent min-h-[3rem]"
          placeholder="What happened in your football journey today?"
          rows={2}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between mt-md pt-md border-t border-outline-variant gap-sm">
        <div className="flex gap-xs flex-wrap">
          {TAGS.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setType((cur) => (cur === t.type ? "TEXT" : t.type))}
              className={`flex items-center gap-xs px-sm py-1.5 rounded-full text-label-md transition-colors ${
                type === t.type
                  ? "bg-primary-container/20 text-primary"
                  : "hover:bg-surface-container text-on-surface-variant"
              }`}
            >
              <Icon name={t.icon} size={20} /> {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={pending || !content.trim()}
          className="bg-primary text-on-primary px-lg py-2 rounded-full font-bold text-label-md shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </section>
  );
}
