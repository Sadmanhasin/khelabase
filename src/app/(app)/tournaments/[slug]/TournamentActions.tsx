"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  registerTeamForTournament,
  respondToTeamRegistration,
  generateFixtures,
  recordMatchResult,
} from "@/lib/actions/tournaments";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export function RegisterTeamButton({
  tournamentId,
  myTeams,
  path,
}: {
  tournamentId: string;
  myTeams: { id: string; name: string }[];
  path: string;
}) {
  const router = useRouter();
  const [teamId, setTeamId] = useState(myTeams[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (myTeams.length === 0) {
    return (
      <Button href="/teams/create" variant="secondary">
        <Icon name="add" size={18} /> Create a team to register
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-xs">
      <div className="flex gap-xs">
        <Select value={teamId} onChange={(e) => setTeamId(e.target.value)} className="!py-2">
          {myTeams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        <Button
          disabled={pending || !teamId}
          onClick={() =>
            startTransition(async () => {
              const res = await registerTeamForTournament(tournamentId, teamId, path);
              setMsg(res.ok ? "Registration submitted!" : res.error);
              router.refresh();
            })
          }
        >
          Register
        </Button>
      </div>
      {msg && <span className="text-label-sm text-on-surface-variant">{msg}</span>}
    </div>
  );
}

export function RegistrationActions({ regId, path }: { regId: string; path: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function respond(approve: boolean) {
    startTransition(async () => {
      await respondToTeamRegistration(regId, approve, path);
      router.refresh();
    });
  }
  return (
    <div className="flex gap-xs">
      <Button size="sm" disabled={pending} onClick={() => respond(true)}>Approve</Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => respond(false)}>Reject</Button>
    </div>
  );
}

export function GenerateFixturesButton({ tournamentId, path }: { tournamentId: string; path: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-sm">
      <Button
        variant="tertiary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await generateFixtures(tournamentId, path);
            setMsg(res.ok ? `Generated ${res.created} fixtures` : res.error);
            router.refresh();
          })
        }
      >
        <Icon name="auto_awesome" size={18} /> {pending ? "Generating…" : "Generate Fixtures"}
      </Button>
      {msg && <span className="text-label-sm text-on-surface-variant">{msg}</span>}
    </div>
  );
}

export function MatchResultForm({
  matchId,
  home,
  away,
  path,
}: {
  matchId: string;
  home: number;
  away: number;
  path: string;
}) {
  const router = useRouter();
  const [h, setH] = useState(home);
  const [a, setA] = useState(away);
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex items-center gap-xs">
      <Input type="number" min={0} value={h} onChange={(e) => setH(Number(e.target.value))} className="w-14 !py-1 text-center" />
      <span className="text-on-surface-variant">-</span>
      <Input type="number" min={0} value={a} onChange={(e) => setA(Number(e.target.value))} className="w-14 !py-1 text-center" />
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await recordMatchResult(matchId, h, a, path);
            router.refresh();
          })
        }
      >
        Save
      </Button>
    </div>
  );
}
