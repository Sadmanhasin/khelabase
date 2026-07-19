"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestToJoin, respondToJoinRequest } from "@/lib/actions/teams";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function JoinTeamButton({ teamId, path }: { teamId: string; path: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await requestToJoin(teamId, path);
          router.refresh();
        })
      }
    >
      <Icon name="person_add" size={18} /> Request to Join
    </Button>
  );
}

export function JoinRequestActions({ memberId, path }: { memberId: string; path: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function respond(approve: boolean) {
    startTransition(async () => {
      await respondToJoinRequest(memberId, approve, path);
      router.refresh();
    });
  }
  return (
    <div className="flex gap-xs">
      <Button size="sm" disabled={pending} onClick={() => respond(true)}>Approve</Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => respond(false)}>Decline</Button>
    </div>
  );
}
