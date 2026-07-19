"use client";

import { useState, useTransition } from "react";
import { createTournament } from "@/lib/actions/tournaments";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const FORMATS = [["F5", "5v5"], ["F6", "6v6"], ["F7", "7v7"], ["F8", "8v8"], ["F11", "11v11"]];
const TYPES = [
  ["KNOCKOUT", "Knockout"],
  ["LEAGUE", "League"],
  ["LEAGUE_KNOCKOUT", "League + Knockout"],
  ["GROUP_STAGE", "Group Stage"],
  ["DOUBLE_ELIMINATION", "Double Elimination"],
  ["FRIENDLY", "Friendly"],
];
const AGES = [["OPEN", "Open"], ["U14", "U14"], ["U16", "U16"], ["U18", "U18"], ["U21", "U21"], ["VETERANS", "Veterans"]];
const GENDERS = [["MALE", "Male"], ["FEMALE", "Female"], ["MIXED", "Mixed"]];
const VIS = [["PUBLIC", "Public"], ["PRIVATE", "Private"], ["INVITE_ONLY", "Invite Only"]];

export function CreateTournamentForm({ existingOrganizer }: { existingOrganizer: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTournament(fd);
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

        <Field label="Tournament name">
          <Input name="name" placeholder="Dhaka Super Cup 2024" required />
        </Field>

        <Field label="Organizer name" hint={existingOrganizer ? `Using your organizer: ${existingOrganizer}` : "We'll create your organizer profile automatically."}>
          <Input name="organizerName" defaultValue={existingOrganizer ?? ""} placeholder="Dhaka Football Association" />
        </Field>

        <Field label="Description">
          <Textarea name="description" placeholder="Describe your tournament, rules and prizes…" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <Field label="Location"><Input name="location" placeholder="Dhaka" /></Field>
          <Field label="Season"><Input name="season" placeholder="2024" /></Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
          <Field label="Format">
            <Select name="format" defaultValue="F11">{FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          </Field>
          <Field label="Type">
            <Select name="type" defaultValue="LEAGUE">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          </Field>
          <Field label="Age">
            <Select name="ageCategory" defaultValue="OPEN">{AGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          </Field>
          <Field label="Gender">
            <Select name="gender" defaultValue="MALE">{GENDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          </Field>
          <Field label="Visibility">
            <Select name="visibility" defaultValue="PUBLIC">{VIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
          </Field>
          <Field label="Max teams">
            <Input name="maxTeams" type="number" min={2} max={128} placeholder="16" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <Field label="Entry fee (৳)"><Input name="entryFee" type="number" min={0} placeholder="0" /></Field>
          <Field label="Prize money (৳)"><Input name="prizeMoney" type="number" min={0} placeholder="0" /></Field>
        </div>

        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creating…" : "Create Tournament"}
        </Button>
      </form>
    </Card>
  );
}
