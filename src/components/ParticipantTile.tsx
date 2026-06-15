"use client";

import { useMemo } from "react";
import { useIsSpeaking } from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { Mic, MicOff } from "lucide-react";
import { Avatar } from "./ui/Avatar";
import { cn } from "./ui/cn";

// One participant in the room: avatar, name, live speaking ring, and mic state.
// `isSpeaking` and mic state come from LiveKit events (reactive), never polled.
export function ParticipantTile({
  participant,
  isLocal,
}: {
  participant: Participant;
  isLocal: boolean;
}) {
  const isSpeaking = useIsSpeaking(participant);
  const name = participant.name || participant.identity;
  // isMicrophoneEnabled reflects whether an unmuted mic track is published.
  const micOn = participant.isMicrophoneEnabled;
  // Logged-in users carry their profile picture in participant metadata.
  const avatarUrl = useMemo(() => {
    if (!participant.metadata) return null;
    try {
      return (JSON.parse(participant.metadata).avatarUrl as string) ?? null;
    } catch {
      return null;
    }
  }, [participant.metadata]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors",
        isSpeaking
          ? "border-accent-glow/70 bg-accent/10"
          : "border-white/5 bg-ink-700/50",
      )}
    >
      <div
        className={cn(
          "rounded-full",
          isSpeaking && "animate-speak-pulse ring-2 ring-accent-glow",
        )}
      >
        <Avatar name={name} src={avatarUrl} size={56} />
      </div>

      <div className="flex max-w-full items-center gap-1.5">
        <span className="truncate text-sm font-medium text-slate-100">
          {name}
          {isLocal && <span className="text-slate-500"> (you)</span>}
        </span>
        {micOn ? (
          <Mic size={14} className="shrink-0 text-emerald-400" />
        ) : (
          <MicOff size={14} className="shrink-0 text-slate-500" />
        )}
      </div>
    </div>
  );
}
