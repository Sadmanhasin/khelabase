"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleLike } from "@/lib/actions/posts";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { timeAgo } from "@/lib/utils";

export type FeedPost = {
  id: string;
  type: string;
  content: string | null;
  createdAt: string;
  author: { name: string | null; username: string | null; image: string | null };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

const TYPE_LABEL: Record<string, { label: string; tone: "primary" | "gold" | "tertiary" | "neutral"; icon: string } | undefined> = {
  ACHIEVEMENT: { label: "Achievement", tone: "gold", icon: "military_tech" },
  MATCH_RESULT: { label: "Match Result", tone: "tertiary", icon: "scoreboard" },
  TRANSFER: { label: "Transfer", tone: "primary", icon: "swap_horiz" },
  AWARD: { label: "Award", tone: "gold", icon: "emoji_events" },
};

export function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [count, setCount] = useState(post.likeCount);
  const [, startTransition] = useTransition();
  const meta = TYPE_LABEL[post.type];

  function onLike() {
    setLiked((v) => !v);
    setCount((c) => c + (liked ? -1 : 1));
    startTransition(() => {
      toggleLike(post.id);
    });
  }

  return (
    <article className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="p-md flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Avatar src={post.author.image} name={post.author.name} size={40} />
          <div>
            <Link
              href={post.author.username ? `/players/${post.author.username}` : "#"}
              className="font-title-lg text-body-lg text-on-surface leading-tight hover:underline"
            >
              {post.author.name ?? "Player"}
            </Link>
            <p className="text-label-md text-on-surface-variant">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {meta && (
          <Badge tone={meta.tone}>
            <Icon name={meta.icon} size={14} filled /> {meta.label}
          </Badge>
        )}
      </div>
      {post.content && (
        <div className="px-md pb-md">
          <p className="text-body-md whitespace-pre-wrap">{post.content}</p>
        </div>
      )}
      <div className="p-sm flex items-center justify-around border-t border-outline-variant">
        <button
          onClick={onLike}
          className={`flex items-center gap-xs py-2 flex-1 justify-center rounded-lg hover:bg-surface-container transition-colors ${
            liked ? "text-primary" : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <Icon name="favorite" filled={liked} /> <span className="text-label-md">{count}</span>
        </button>
        <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary py-2 flex-1 justify-center rounded-lg hover:bg-surface-container transition-colors">
          <Icon name="chat_bubble" /> <span className="text-label-md">{post.commentCount}</span>
        </button>
        <button className="flex items-center gap-xs text-on-surface-variant hover:text-primary py-2 flex-1 justify-center rounded-lg hover:bg-surface-container transition-colors">
          <Icon name="share" /> <span className="text-label-md">Share</span>
        </button>
      </div>
    </article>
  );
}
