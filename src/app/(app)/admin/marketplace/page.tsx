import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Admin · Marketplace" };

export default async function AdminMarketplacePage() {
  const [products, orders, revenue] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { seller: { select: { name: true } }, _count: { select: { orderItems: true } } } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-3 gap-md">
        <Stat label="Products" value={products.length} />
        <Stat label="Orders" value={orders} />
        <Stat label="GMV" value={`৳${(revenue._sum.total ?? 0).toLocaleString()}`} />
      </div>
      <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-sm p-md">
            <div className="min-w-0 flex-1">
              <Link href={`/marketplace/product/${p.slug}`} className="font-label-md text-body-md hover:text-primary truncate block">{p.name}</Link>
              <p className="text-label-sm text-on-surface-variant">by {p.seller.name} · {p._count.orderItems} sold</p>
            </div>
            <Badge tone="neutral">{p.category}</Badge>
            <span className="font-extrabold text-primary w-24 text-right">৳{p.price.toLocaleString()}</span>
            <Badge tone={p.stock > 0 ? "success" : "error"}>{p.stock} in stock</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl border border-outline-variant p-md">
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className="text-headline-md font-extrabold text-primary">{value}</p>
    </div>
  );
}
