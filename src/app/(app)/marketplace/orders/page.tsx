import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "My Orders" };

type Props = { searchParams: Promise<{ placed?: string }> };

const STATUS_TONE: Record<string, "primary" | "success" | "neutral" | "error"> = {
  PENDING: "primary",
  PAID: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

export default async function OrdersPage({ searchParams }: Props) {
  const { placed } = await searchParams;
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/marketplace/orders");

  const orders = await prisma.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="px-md py-lg max-w-3xl mx-auto">
      <PageHeader title="My Orders" icon="receipt_long" action={<Button href="/marketplace" variant="secondary">Continue shopping</Button>} />

      {placed && (
        <div className="flex items-center gap-sm bg-primary-container/10 text-primary rounded-xl px-md py-sm mb-lg">
          <Icon name="check_circle" filled /> Order placed successfully! Sellers have been notified.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="receipt_long" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-md">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-outline-variant p-md">
              <div className="flex items-center justify-between mb-sm">
                <div className="flex items-center gap-sm">
                  <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                  <span className="text-label-sm text-on-surface-variant">{timeAgo(o.createdAt)}</span>
                </div>
                <span className="font-extrabold text-primary">৳{o.total.toLocaleString()}</span>
              </div>
              <ul className="text-body-md text-on-surface-variant space-y-0.5">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.name} × {it.quantity}</span>
                    <span>৳{(it.price * it.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
