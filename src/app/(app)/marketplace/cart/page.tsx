import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { CartControls } from "../MarketplaceClient";
import { checkout } from "@/lib/actions/marketplace";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/marketplace/cart");

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: "asc" },
  });
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="px-md py-lg max-w-3xl mx-auto">
      <PageHeader title="Your Cart" icon="shopping_cart" />
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-outline-variant p-2xl text-center">
          <Icon name="shopping_cart_off" size={48} className="text-outline-variant" />
          <p className="font-title-lg text-title-lg mt-md">Your cart is empty</p>
          <Button href="/marketplace" className="mt-md">Browse products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-md p-md">
                <div className="w-16 h-16 rounded-lg bg-surface-container-low flex items-center justify-center overflow-hidden shrink-0">
                  {i.product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon name="inventory_2" className="text-outline-variant" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/marketplace/product/${i.product.slug}`} className="font-label-md text-body-md hover:text-primary line-clamp-1">
                    {i.product.name}
                  </Link>
                  <p className="text-primary font-bold">৳{i.product.price.toLocaleString()}</p>
                  <div className="mt-xs"><CartControls itemId={i.id} quantity={i.quantity} /></div>
                </div>
                <span className="font-extrabold">৳{(i.product.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <form action={checkout} className="bg-white rounded-xl border border-outline-variant p-lg h-fit space-y-md">
            <h3 className="text-title-lg font-title-lg">Checkout</h3>
            <div className="flex items-center justify-between text-body-lg">
              <span className="text-on-surface-variant">Total</span>
              <span className="font-extrabold text-primary">৳{total.toLocaleString()}</span>
            </div>
            <Field label="Delivery address">
              <Textarea name="address" placeholder="House, road, area, district" required />
            </Field>
            <Field label="Phone">
              <Input name="phone" placeholder="01XXXXXXXXX" required />
            </Field>
            <Button type="submit" size="lg" className="w-full">Place Order (Cash on Delivery)</Button>
            <p className="text-label-sm text-on-surface-variant text-center">Payment on delivery. Sellers are notified instantly.</p>
          </form>
        </div>
      )}
    </div>
  );
}
