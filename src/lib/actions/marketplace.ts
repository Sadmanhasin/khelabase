"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { ProductCategory } from "@prisma/client";
import { notify } from "@/lib/actions/notifications";

const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1000).optional(),
  category: z.nativeEnum(ProductCategory),
  price: z.coerce.number().int().min(1),
  stock: z.coerce.number().int().min(0),
  brand: z.string().trim().max(40).optional(),
});

export async function createProduct(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    brand: formData.get("brand") || undefined,
  });
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  const base = slugify(parsed.data.name);
  let slug = base;
  let n = 0;
  while (await prisma.product.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }

  const product = await prisma.product.create({
    data: {
      sellerId: userId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      category: parsed.data.category,
      price: parsed.data.price,
      stock: parsed.data.stock,
      brand: parsed.data.brand ?? null,
      images: [],
    },
  });
  revalidatePath("/marketplace");
  redirect(`/marketplace/product/${product.slug}`);
}

export async function addToCart(productId: string, path: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity: 1 },
    update: { quantity: { increment: 1 } },
  });
  revalidatePath(path);
  revalidatePath("/marketplace/cart");
  return { ok: true as const };
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Login required" };
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) return { ok: false as const, error: "Not found" };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  revalidatePath("/marketplace/cart");
  return { ok: true as const };
}

export async function checkout(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/marketplace/cart");

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
  if (items.length === 0) redirect("/marketplace/cart");

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      buyerId: userId,
      total,
      status: "PENDING",
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })),
      },
    },
  });

  // Notify sellers and decrement stock.
  for (const i of items) {
    await prisma.product.update({
      where: { id: i.productId },
      data: { stock: { decrement: Math.min(i.quantity, i.product.stock) } },
    });
    await notify({
      userId: i.product.sellerId,
      actorId: userId,
      type: "MARKETPLACE",
      title: `New order for ${i.product.name}`,
      body: `Quantity: ${i.quantity}`,
      link: "/marketplace/orders",
    });
  }

  await prisma.cartItem.deleteMany({ where: { userId } });
  revalidatePath("/marketplace/cart");
  redirect(`/marketplace/orders?placed=${order.id}`);
}
