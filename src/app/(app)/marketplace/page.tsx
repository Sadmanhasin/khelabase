import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { AddToCartButton } from "./MarketplaceClient";
import { Prisma, ProductCategory } from "@prisma/client";

export const metadata = { title: "Marketplace" };

const CATEGORIES: { value: ProductCategory | "ALL"; label: string; icon: string }[] = [
  { value: "ALL", label: "All", icon: "grid_view" },
  { value: "JERSEY", label: "Jerseys", icon: "checkroom" },
  { value: "BOOTS", label: "Boots", icon: "footprint" },
  { value: "FOOTBALL", label: "Footballs", icon: "sports_soccer" },
  { value: "GLOVES", label: "Gloves", icon: "sports_mma" },
  { value: "TRAINING", label: "Training", icon: "fitness_center" },
  { value: "ACCESSORY", label: "Accessories", icon: "backpack" },
];

type Props = { searchParams: Promise<{ category?: string }> };

export default async function MarketplacePage({ searchParams }: Props) {
  const sp = await searchParams;
  const userId = await getCurrentUserId();

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (sp.category && sp.category !== "ALL") where.category = sp.category as ProductCategory;

  const [products, cartCount] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: 48, include: { seller: { select: { name: true } } } }),
    userId ? prisma.cartItem.count({ where: { userId } }) : 0,
  ]);

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader
        title="Marketplace"
        subtitle="Jerseys, boots, footballs and gear."
        icon="storefront"
        action={
          <div className="flex items-center gap-xs">
            <Button href="/marketplace/cart" variant="secondary">
              <Icon name="shopping_cart" size={18} /> Cart{cartCount ? ` (${cartCount})` : ""}
            </Button>
            {userId && <Button href="/marketplace/sell"><Icon name="add" size={18} /> Sell</Button>}
          </div>
        }
      />

      <div className="flex flex-wrap gap-xs mb-lg">
        {CATEGORIES.map((c) => {
          const active = (sp.category ?? "ALL") === c.value;
          return (
            <Link
              key={c.value}
              href={c.value === "ALL" ? "/marketplace" : `/marketplace?category=${c.value}`}
              className={`flex items-center gap-xs px-md py-1.5 rounded-full text-label-md border transition-all ${active ? "bg-primary text-on-primary border-primary" : "bg-white border-outline-variant hover:border-primary"}`}
            >
              <Icon name={c.icon} size={16} /> {c.label}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="storefront" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">No products yet</p>
          {userId && <Button href="/marketplace/sell" className="mt-md">List the first product</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-outline-variant overflow-hidden premium-card-shadow flex flex-col">
              <Link href={`/marketplace/product/${p.slug}`} className="block">
                <div className="aspect-square bg-surface-container-low relative flex items-center justify-center">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon name={CATEGORIES.find((c) => c.value === p.category)?.icon ?? "inventory_2"} size={48} className="text-outline-variant" />
                  )}
                  {p.stock === 0 && <span className="absolute top-2 left-2"><Badge tone="error">Out of stock</Badge></span>}
                </div>
              </Link>
              <div className="p-md flex flex-col flex-1">
                <Badge tone="neutral" className="self-start mb-xs">{p.category}</Badge>
                <Link href={`/marketplace/product/${p.slug}`} className="font-title-lg text-body-md hover:text-primary line-clamp-2">{p.name}</Link>
                <p className="text-label-sm text-on-surface-variant mt-0.5">{p.brand ?? p.seller.name}</p>
                <div className="flex items-center justify-between mt-sm pt-sm">
                  <span className="font-extrabold text-primary text-body-lg">৳{p.price.toLocaleString()}</span>
                </div>
                {userId && <div className="mt-sm"><AddToCartButton productId={p.id} path="/marketplace" disabled={p.stock === 0} full /></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
