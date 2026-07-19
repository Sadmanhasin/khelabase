"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMember, removeMember } from "@/lib/actions/teams";
import { Avatar } from "@/components/ui/Avatar";
import { Select, Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import type { TeamRole } from "@prisma/client";

type Member = {
  id: string;
  name: string;
  image: string | null;
  role: TeamRole;
  jerseyNumber: number | null;
};

const ROLES: TeamRole[] = ["OWNER", "MANAGER", "CAPTAIN", "COACH", "ASSISTANT", "PLAYER"];

export function ManageRoster({
  members,
  path,
  isOwner,
}: {
  members: Member[];
  path: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function changeRole(id: string, role: TeamRole) {
    startTransition(async () => {
      await updateMember(id, { role }, path);
      router.refresh();
    });
  }
  function changeJersey(id: string, jersey: string) {
    const n = jersey === "" ? null : Number(jersey);
    startTransition(async () => {
      await updateMember(id, { jerseyNumber: n }, path);
      router.refresh();
    });
  }
  function remove(id: string) {
    startTransition(async () => {
      await removeMember(id, path);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-xl border border-outline-variant divide-y divide-outline-variant overflow-hidden">
      {members.map((m) => (
        <div key={m.id} className="flex flex-wrap items-center gap-sm p-md">
          <Avatar src={m.image} name={m.name} size={44} />
          <span className="font-label-md text-body-md flex-1 min-w-[8rem]">{m.name}</span>

          <div className="w-16">
            <Input
              type="number"
              min={0}
              max={99}
              defaultValue={m.jerseyNumber ?? ""}
              placeholder="#"
              className="!py-1.5 text-center"
              onBlur={(e) => changeJersey(m.id, e.target.value)}
              disabled={m.role === "OWNER" && !isOwner}
            />
          </div>

          <div className="w-36">
            <Select
              defaultValue={m.role}
              className="!py-1.5"
              onChange={(e) => changeRole(m.id, e.target.value as TeamRole)}
              disabled={m.role === "OWNER"}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>

          <button
            onClick={() => remove(m.id)}
            disabled={m.role === "OWNER"}
            className="p-2 rounded-lg text-error hover:bg-error-container/40 disabled:opacity-30 disabled:hover:bg-transparent"
            title={m.role === "OWNER" ? "Owner can't be removed" : "Remove"}
          >
            <Icon name="person_remove" size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
