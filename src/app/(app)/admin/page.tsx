import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboard() {
  const [users, players, teams, tournaments, matches, products, orders, revenueAgg, recentUsers, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.playerProfile.count(),
    prisma.team.count(),
    prisma.tournament.count(),
    prisma.match.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { name: true, email: true, createdAt: true, username: true, id: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { buyer: { select: { name: true } } } }),
  ]);

  const stats = [
    { icon: "group", label: "Users", value: users, tone: "text-primary" },
    { icon: "sports_soccer", label: "Players", value: players, tone: "text-primary" },
    { icon: "diversity_3", label: "Teams", value: teams, tone: "text-tertiary" },
    { icon: "emoji_events", label: "Tournaments", value: tournaments, tone: "text-secondary" },
    { icon: "stadium", label: "Matches", value: matches, tone: "text-primary" },
    { icon: "storefront", label: "Products", value: products, tone: "text-tertiary" },
    { icon: "receipt_long", label: "Orders", value: orders, tone: "text-primary" },
    { icon: "payments", label: "GMV", value: `৳${(revenueAgg._sum.total ?? 0).toLocaleString()}`, tone: "text-secondary" },
  ];

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-outline-variant p-md premium-card-shadow">
            <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
              <Icon name={s.icon} size={18} /> <span className="text-label-md">{s.label}</span>
            </div>
            <p className={`text-headline-md font-extrabold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Newest Users</h3>
          <div className="divide-y divide-outline-variant">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-sm">
                <div>
                  <Link href={`/players/${u.username ?? u.id}`} className="font-label-md text-body-md hover:text-primary">{u.name}</Link>
                  <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                </div>
                <span className="text-label-sm text-on-surface-variant">{timeAgo(u.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-outline-variant p-lg">
          <h3 className="text-title-lg font-title-lg mb-md">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No orders yet.</p>
          ) : (
            <div className="divide-y divide-outline-variant">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-sm">
                  <div>
                    <p className="font-label-md text-body-md">{o.buyer.name}</p>
                    <p className="text-label-sm text-on-surface-variant">{o.status}</p>
                  </div>
                  <span className="font-extrabold text-primary">৳{o.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
