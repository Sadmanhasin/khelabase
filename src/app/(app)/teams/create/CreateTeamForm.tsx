"use client";

import { useState, useTransition } from "react";
import { createTeam } from "@/lib/actions/teams";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { BD_DISTRICTS } from "@/lib/utils";

const FORMATS = [
  ["F5", "5-a-side"],
  ["F6", "6-a-side"],
  ["F7", "7-a-side"],
  ["F8", "8-a-side"],
  ["F11", "11-a-side"],
];
const TYPES = [
  ["SOCIAL", "Social Team"],
  ["ACADEMY", "Academy"],
  ["CLUB", "Club"],
];

export function CreateTeamForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTeam(fd);
      // createTeam redirects on success; only errors return here.
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <div className="sm:col-span-2">
            <Field label="Team name">
              <Input name="name" placeholder="Dhaka Tigers FC" required />
            </Field>
          </div>
          <Field label="Short name">
            <Input name="shortName" placeholder="DTF" maxLength={10} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea name="description" placeholder="What's your team about?" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <Field label="District">
            <Select name="district" defaultValue="">
              <option value="">Select</option>
              {BD_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Format">
            <Select name="format" defaultValue="F11" required>
              {FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Type">
            <Select name="type" defaultValue="SOCIAL" required>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
        </div>
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creating…" : "Create Team"}
        </Button>
      </form>
    </Card>
  );
}
