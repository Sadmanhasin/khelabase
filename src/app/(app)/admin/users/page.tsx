import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/Avatar";
import { UserActions } from "./UserActions";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin · Users" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const users = await prisma.user.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, email: true, username: true, image: true, district: true, isVerified: true, isAdmin: true, createdAt: true },
  });

  return (
    <div>
      <form className="mb-md">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search users by name or email…"
          className="w-full max-w-md rounded-lg border border-outline-variant bg-white px-md py-sm text-body-md focus:border-primary focus:outline-none"
        />
      </form>
      <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-sm p-md">
            <Avatar src={u.image} name={u.name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="font-label-md text-body-md truncate">{u.name}</p>
              <p className="text-label-sm text-on-surface-variant truncate">{u.email} · {u.district ?? "—"} · joined {timeAgo(u.createdAt)}</p>
            </div>
            <UserActions userId={u.id} isVerified={u.isVerified} isAdmin={u.isAdmin} />
          </div>
        ))}
      </div>
    </div>
  );
}
