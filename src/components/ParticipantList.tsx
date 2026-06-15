"use client";

import { useCallback } from "react";
import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import { ParticipantTile } from "./ParticipantTile";

// Live presence grid. useParticipants() re-renders on join/leave, so this stays
// in sync automatically as people come and go. If the current user owns this
// room, each remote tile gets a "remove" control.
export function ParticipantList({
  code,
  isOwner,
}: {
  code: string;
  isOwner: boolean;
}) {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const kick = useCallback(
    async (identity: string) => {
      await fetch(`/api/rooms/${code}/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity }),
      });
    },
    [code],
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        In this room
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-400">
          {participants.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {participants.map((p) => {
          const isLocal = p.sid === localParticipant.sid;
          return (
            <ParticipantTile
              key={p.sid}
              participant={p}
              isLocal={isLocal}
              canKick={isOwner && !isLocal}
              onKick={() => kick(p.identity)}
            />
          );
        })}
      </div>
    </div>
  );
}
