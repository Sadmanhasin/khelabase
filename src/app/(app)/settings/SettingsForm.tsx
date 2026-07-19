"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/profile";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BD_DISTRICTS } from "@/lib/utils";

export function SettingsForm({
  user,
}: {
  user: { name: string; bio: string; district: string; phone: string };
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfile(fd);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Card className="p-lg">
      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        <Field label="Full name">
          <Input name="name" defaultValue={user.name} required />
        </Field>
        <Field label="Bio">
          <Textarea name="bio" defaultValue={user.bio} placeholder="Tell the community about your football journey…" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <Field label="District">
            <Select name="district" defaultValue={user.district}>
              <option value="">Select district</option>
              {BD_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Phone">
            <Input name="phone" defaultValue={user.phone} placeholder="01XXXXXXXXX" />
          </Field>
        </div>
        <div className="flex items-center gap-md">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          {saved && <span className="text-primary text-label-md">Saved ✓</span>}
          {error && <span className="text-error text-label-md">{error}</span>}
        </div>
      </form>
    </Card>
  );
}
