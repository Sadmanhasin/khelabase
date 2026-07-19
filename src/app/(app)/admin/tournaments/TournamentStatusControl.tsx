"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTournamentStatusAdmin } from "@/lib/actions/admin";
import type { TournamentStatus } from "@prisma/client";

const STATUSES: TournamentStatus[] = [
  "DRAFT", "PENDING_APPROVAL", "REGISTRATION_OPEN", "ONGOING", "COMPLETED", "CANCELLED",
];

export function TournamentStatusControl({ id, status }: { id: string; status: TournamentStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          await setTournamentStatusAdmin(id, e.target.value as TournamentStatus);
          router.refresh();
        })
      }
      className="rounded-lg border border-outline-variant bg-white px-2 py-1 text-label-md focus:border-primary focus:outline-none"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
      ))}
    </select>
  );
}
