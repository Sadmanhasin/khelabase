"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart, updateCartQuantity } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function AddToCartButton({
  productId,
  path,
  disabled,
  full,
}: {
  productId: string;
  path: string;
  disabled?: boolean;
  full?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="primary"
      disabled={pending || disabled}
      className={full ? "w-full" : ""}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(async () => {
          await addToCart(productId, path);
          router.refresh();
        });
      }}
    >
      <Icon name="add_shopping_cart" size={18} /> {disabled ? "Out of stock" : "Add to Cart"}
    </Button>
  );
}

export function CartControls({ itemId, quantity }: { itemId: string; quantity: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function set(q: number) {
    startTransition(async () => {
      await updateCartQuantity(itemId, q);
      router.refresh();
    });
  }
  return (
    <div className="flex items-center gap-xs">
      <button onClick={() => set(quantity - 1)} disabled={pending} className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container">
        <Icon name="remove" size={18} />
      </button>
      <span className="w-8 text-center font-label-md">{quantity}</span>
      <button onClick={() => set(quantity + 1)} disabled={pending} className="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container">
        <Icon name="add" size={18} />
      </button>
      <button onClick={() => set(0)} disabled={pending} className="ml-sm p-1.5 rounded-lg text-error hover:bg-error-container/40">
        <Icon name="delete" size={18} />
      </button>
    </div>
  );
}
