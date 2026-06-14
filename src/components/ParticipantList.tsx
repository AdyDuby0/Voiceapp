"use client";

import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import { ParticipantTile } from "./ParticipantTile";

// Live presence grid. useParticipants() re-renders on join/leave, so this stays
// in sync automatically as people come and go.
export function ParticipantList() {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        In this room
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-400">
          {participants.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {participants.map((p) => (
          <ParticipantTile
            key={p.sid}
            participant={p}
            isLocal={p.sid === localParticipant.sid}
          />
        ))}
      </div>
    </div>
  );
}
