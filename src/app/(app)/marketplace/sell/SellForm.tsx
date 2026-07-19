"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/lib/actions/marketplace";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const CATEGORIES = [
  ["JERSEY", "Jersey"], ["BOOTS", "Boots"], ["FOOTBALL", "Football"],
  ["GLOVES", "Gloves"], ["TRAINING", "Training"], ["ACCESSORY", "Accessory"],
];

export function SellForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createProduct(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <Card className="p-lg">
      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        {error && (
          <div className="flex items-center gap-xs bg-error-container text-on-error-container rounded-lg px-md py-sm text-body-md">
            <Icon name="error" size={20} /> {error}
          </div>
        )}
        <Field label="Product name">
          <Input name="name" placeholder="Home Jersey 2024" required />
        </Field>
        <Field label="Description">
          <Textarea name="description" placeholder="Material, size, condition…" />
        </Field>
        <div className="grid grid-cols-2 gap-md">
          <Field label="Category">
            <Select name="category" defaultValue="JERSEY">{CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          </Field>
          <Field label="Brand">
            <Input name="brand" placeholder="Nike, Adidas…" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-md">
          <Field label="Price (৳)">
            <Input name="price" type="number" min={1} placeholder="1200" required />
          </Field>
          <Field label="Stock">
            <Input name="stock" type="number" min={0} defaultValue={1} required />
          </Field>
        </div>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Listing…" : "List Product"}
        </Button>
      </form>
    </Card>
  );
}
