"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logMatchEvent, deleteMatchEvent, setMatchStatus, type LogEventInput } from "@/lib/actions/matches";
import { Icon } from "@/components/ui/Icon";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { MatchEventType, MatchStatus } from "@prisma/client";

type Player = { playerId: string; name: string; jersey: number | null };
type EventRow = { id: string; type: string; minute: number | null; teamId: string | null; playerName: string | null };

const QUICK: { type: MatchEventType; label: string; icon: string; assist?: boolean }[] = [
  { type: "GOAL", label: "Goal", icon: "sports_soccer", assist: true },
  { type: "YELLOW_CARD", label: "Yellow", icon: "style" },
  { type: "RED_CARD", label: "Red", icon: "style" },
  { type: "SUBSTITUTION", label: "Sub", icon: "swap_horiz" },
  { type: "PENALTY", label: "Penalty", icon: "sports_score" },
  { type: "OWN_GOAL", label: "Own Goal", icon: "unpublished" },
  { type: "INJURY", label: "Injury", icon: "personal_injury" },
  { type: "CORNER", label: "Corner", icon: "flag" },
];

export function MatchControl({
  matchId,
  path,
  status,
  homeName,
  awayName,
  homeTeamId,
  homeScore,
  awayScore,
  home,
  away,
  events,
}: {
  matchId: string;
  path: string;
  status: MatchStatus;
  homeName: string;
  awayName: string;
  homeTeamId: string;
  homeScore: number;
  awayScore: number;
  home: Player[];
  away: Player[];
  events: EventRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [side, setSide] = useState<"HOME" | "AWAY">("HOME");
  const [type, setType] = useState<MatchEventType>("GOAL");
  const [playerId, setPlayerId] = useState("");
  const [assistId, setAssistId] = useState("");
  const [minute, setMinute] = useState("");

  const roster = side === "HOME" ? home : away;
  const activeQuick = QUICK.find((q) => q.type === type);

  function refresh() {
    router.refresh();
  }

  function log() {
    const player = roster.find((p) => p.playerId === playerId);
    const assist = roster.find((p) => p.playerId === assistId);
    const input: LogEventInput = {
      matchId,
      type,
      side,
      minute: minute ? Number(minute) : undefined,
      playerId: playerId || undefined,
      playerName: player?.name,
      relatedPlayerId: assistId || undefined,
      note: assist ? `Assist: ${assist.name}` : undefined,
    };
    startTransition(async () => {
      await logMatchEvent(input, path);
      setAssistId("");
      refresh();
    });
  }

  function changeStatus(s: MatchStatus) {
    startTransition(async () => {
      await setMatchStatus(matchId, s, path);
      refresh();
    });
  }

  function removeEvent(id: string) {
    startTransition(async () => {
      await deleteMatchEvent(id, path);
      refresh();
    });
  }

  return (
    <div className="space-y-lg">
      {/* Scoreboard + session */}
      <section className="bg-white rounded-xl border border-outline-variant p-lg">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1 min-w-0">
            <p className="font-label-md text-on-surface-variant truncate">{homeName}</p>
            <p className="text-headline-lg font-black">{homeScore}</p>
          </div>
          <span className="text-headline-md text-surface-variant px-md">:</span>
          <div className="text-center flex-1 min-w-0">
            <p className="font-label-md text-on-surface-variant truncate">{awayName}</p>
            <p className="text-headline-lg font-black">{awayScore}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-xs justify-center mt-md">
          <StatusBtn active={status === "LIVE"} onClick={() => changeStatus("LIVE")} icon="play_arrow" label="Kick Off" disabled={pending} />
          <StatusBtn active={status === "HALFTIME"} onClick={() => changeStatus("HALFTIME")} icon="pause" label="Half Time" disabled={pending} />
          <StatusBtn active={status === "COMPLETED"} onClick={() => changeStatus("COMPLETED")} icon="flag" label="Full Time" disabled={pending} />
        </div>
      </section>

      {/* Event logger */}
      <section className="bg-white rounded-xl border border-outline-variant p-lg">
        <h3 className="text-title-lg font-title-lg mb-md">Log Event</h3>
        <div className="flex gap-xs mb-md">
          <button
            onClick={() => { setSide("HOME"); setPlayerId(""); setAssistId(""); }}
            className={`flex-1 py-2 rounded-lg font-label-md transition-colors ${side === "HOME" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}
          >
            {homeName}
          </button>
          <button
            onClick={() => { setSide("AWAY"); setPlayerId(""); setAssistId(""); }}
            className={`flex-1 py-2 rounded-lg font-label-md transition-colors ${side === "AWAY" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}
          >
            {awayName}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs mb-md">
          {QUICK.map((q) => (
            <button
              key={q.type}
              onClick={() => setType(q.type)}
              className={`flex flex-col items-center gap-1 p-sm rounded-lg border transition-colors ${
                type === q.type ? "border-primary bg-primary-container/10 text-primary" : "border-outline-variant text-on-surface-variant hover:border-primary"
              }`}
            >
              <Icon name={q.icon} size={22} filled={type === q.type} />
              <span className="text-label-sm">{q.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm items-end">
          <div className="sm:col-span-1">
            <label className="block font-label-md text-label-md mb-1">Player</label>
            <Select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
              <option value="">Select player</option>
              {roster.map((p) => (
                <option key={p.playerId} value={p.playerId}>
                  {p.jersey != null ? `#${p.jersey} ` : ""}{p.name}
                </option>
              ))}
            </Select>
          </div>
          {activeQuick?.assist && (
            <div>
              <label className="block font-label-md text-label-md mb-1">Assist (optional)</label>
              <Select value={assistId} onChange={(e) => setAssistId(e.target.value)}>
                <option value="">None</option>
                {roster.filter((p) => p.playerId !== playerId).map((p) => (
                  <option key={p.playerId} value={p.playerId}>
                    {p.jersey != null ? `#${p.jersey} ` : ""}{p.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex gap-xs items-end">
            <div className="w-20">
              <label className="block font-label-md text-label-md mb-1">Min</label>
              <Input type="number" min={0} max={130} value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="45" />
            </div>
            <Button onClick={log} disabled={pending} className="flex-1">
              <Icon name="add" size={18} /> Log
            </Button>
          </div>
        </div>
        {roster.length === 0 && (
          <p className="text-label-sm text-on-surface-variant mt-sm">
            This team has no players with profiles. Events can still be logged without a player.
          </p>
        )}
      </section>

      {/* Events list */}
      <section className="bg-white rounded-xl border border-outline-variant p-lg">
        <h3 className="text-title-lg font-title-lg mb-md">Timeline ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">No events yet.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-sm">
                <div className="flex items-center gap-sm">
                  <span className="font-mono text-label-md text-on-surface-variant w-8">{e.minute != null ? `${e.minute}'` : "—"}</span>
                  <Badge type={e.type} />
                  <span className="font-label-md text-body-md">{e.playerName ?? "—"}</span>
                  <span className="text-label-sm text-on-surface-variant">{e.teamId === homeTeamId ? homeName : awayName}</span>
                </div>
                <button onClick={() => removeEvent(e.id)} disabled={pending} className="p-1.5 rounded-lg text-error hover:bg-error-container/40">
                  <Icon name="delete" size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusBtn({ active, onClick, icon, label, disabled }: { active: boolean; onClick: () => void; icon: string; label: string; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-xs px-md py-2 rounded-lg font-label-md transition-colors disabled:opacity-50 ${
        active ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
      }`}
    >
      <Icon name={icon} size={18} /> {label}
    </button>
  );
}

function Badge({ type }: { type: string }) {
  const tone =
    type === "GOAL" || type === "PENALTY" ? "bg-primary-container/15 text-primary"
    : type === "RED_CARD" ? "bg-error text-white"
    : type === "YELLOW_CARD" ? "bg-secondary-container text-on-secondary-container"
    : "bg-surface-container-high text-on-surface-variant";
  return <span className={`text-label-sm px-2 py-0.5 rounded-full ${tone}`}>{type.replace(/_/g, " ")}</span>;
}
