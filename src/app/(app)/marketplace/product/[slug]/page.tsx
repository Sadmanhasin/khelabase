import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AddToCartButton } from "../../MarketplaceClient";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { seller: { select: { name: true, username: true, image: true, id: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return { title: p?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, userId] = await Promise.all([getProduct(slug), getCurrentUserId()]);
  if (!p) notFound();

  return (
    <div className="max-w-container-max mx-auto px-md py-lg">
      <Link href="/marketplace" className="text-primary font-bold text-label-md flex items-center gap-xs mb-md">
        <Icon name="arrow_back" size={18} /> Marketplace
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="bg-white rounded-xl border border-outline-variant aspect-square flex items-center justify-center overflow-hidden">
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <Icon name="inventory_2" size={96} className="text-outline-variant" />
          )}
        </div>
        <div>
          <Badge tone="neutral" className="mb-sm">{p.category}</Badge>
          <h1 className="text-headline-lg font-extrabold">{p.name}</h1>
          {p.brand && <p className="text-body-md text-on-surface-variant mt-xs">{p.brand}</p>}
          <p className="text-headline-md font-extrabold text-primary mt-md">৳{p.price.toLocaleString()}</p>
          <p className="text-label-md text-on-surface-variant mt-xs">
            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </p>

          {p.description && <p className="text-body-md text-on-surface-variant mt-lg whitespace-pre-wrap">{p.description}</p>}

          <div className="mt-lg flex items-center gap-sm">
            {userId ? (
              <AddToCartButton productId={p.id} path={`/marketplace/product/${slug}`} disabled={p.stock === 0} />
            ) : (
              <Link href="/login" className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md">Log in to buy</Link>
            )}
          </div>

          <div className="mt-lg pt-lg border-t border-outline-variant flex items-center gap-sm">
            <Avatar src={p.seller.image} name={p.seller.name} size={40} />
            <div>
              <p className="text-label-sm text-on-surface-variant">Sold by</p>
              <Link href={`/players/${p.seller.username ?? p.seller.id}`} className="font-label-md text-body-md hover:text-primary">
                {p.seller.name}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
