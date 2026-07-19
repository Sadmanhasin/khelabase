import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Composer } from "./Composer";
import { PostCard, type FeedPost } from "./PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Home" };

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/feed");

  const [postsRaw, myLikes, trending, suggested] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        author: { select: { name: true, username: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.postLike.findMany({ where: { userId: user.id }, select: { postId: true } }),
    prisma.tournament.findMany({
      where: { status: { in: ["REGISTRATION_OPEN", "ONGOING"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { _count: { select: { teams: true } } },
    }),
    prisma.user.findMany({
      where: { id: { not: user.id } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { name: true, username: true, image: true, district: true },
    }),
  ]);

  const likedSet = new Set(myLikes.map((l) => l.postId));
  const posts: FeedPost[] = postsRaw.map((p) => ({
    id: p.id,
    type: p.type,
    content: p.content,
    createdAt: p.createdAt.toISOString(),
    author: p.author,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    likedByMe: likedSet.has(p.id),
  }));

  return (
    <div className="flex gap-lg px-md py-lg max-w-[1180px] mx-auto">
      <main className="flex-1 max-w-2xl mx-auto w-full">
        <Composer user={{ name: user.name, image: user.image }} />
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
            <Icon name="sports_soccer" size={48} className="text-outline-variant" />
            <p className="font-title-lg text-title-lg mt-md">Your feed is empty</p>
            <p className="text-body-md text-on-surface-variant mt-xs">
              Be the first to post, or follow players and teams to see updates here.
            </p>
          </div>
        ) : (
          <div className="space-y-lg">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </main>

      <aside className="hidden xl:block w-80 shrink-0 space-y-lg">
        <div className="bg-white rounded-xl border border-outline-variant p-md">
          <h3 className="font-title-lg text-title-lg mb-md flex items-center gap-xs">
            <Icon name="local_fire_department" className="text-secondary" filled /> Trending Tournaments
          </h3>
          <div className="space-y-sm">
            {trending.length === 0 && (
              <p className="text-body-md text-on-surface-variant">No live tournaments yet.</p>
            )}
            {trending.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${t.slug}`}
                className="flex items-center gap-sm p-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center">
                  <Icon name="emoji_events" filled />
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-body-md truncate">{t.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{t._count.teams} teams</p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/tournaments" className="block text-center mt-md text-primary font-bold text-label-md hover:underline">
            View all
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant p-md">
          <h3 className="font-title-lg text-title-lg mb-md">Who to follow</h3>
          <div className="space-y-sm">
            {suggested.map((s) => (
              <div key={s.username} className="flex items-center gap-sm">
                <Avatar src={s.image} name={s.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-label-md text-body-md truncate">{s.name}</p>
                  <p className="text-label-sm text-on-surface-variant truncate">
                    {s.district ?? "Bangladesh"}
                  </p>
                </div>
                <Link
                  href={s.username ? `/players/${s.username}` : "#"}
                  className="text-primary font-bold text-label-sm border border-primary rounded-full px-3 py-1 hover:bg-primary-container/10"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
