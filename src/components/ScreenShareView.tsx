"use client";

import {
  useTracks,
  VideoTrack,
  isTrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { ScreenShare } from "lucide-react";

// Shows any active screen shares in the room, full-width above the participants.
// Renders nothing when no one is sharing.
export function ScreenShareView() {
  const tracks = useTracks([Track.Source.ScreenShare]).filter(isTrackReference);

  if (tracks.length === 0) return null;

  return (
    <div className="mb-5 grid gap-3">
      {tracks.map((trackRef) => {
        const name =
          trackRef.participant.name || trackRef.participant.identity;
        return (
          <div
            key={trackRef.publication.trackSid}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black"
          >
            <VideoTrack
              trackRef={trackRef}
              className="max-h-[60vh] w-full object-contain"
            />
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-xs text-slate-100 backdrop-blur">
              <ScreenShare size={13} className="text-accent-glow" />
              {name} is sharing
            </div>
          </div>
        );
      })}
    </div>
  );
}
