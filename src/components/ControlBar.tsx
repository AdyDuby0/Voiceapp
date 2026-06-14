"use client";

import { useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff } from "lucide-react";
import { cn } from "./ui/cn";
import { PushToTalk } from "./PushToTalk";

// Bottom control bar: microphone mute toggle + push-to-talk mode.
// The mic toggle uses LiveKit's useTrackToggle so publish/mute state stays
// authoritative on the server.
export function ControlBar() {
  const { toggle, enabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  return (
    <div className="flex items-center justify-center gap-3 border-t border-white/5 bg-ink-800/60 px-5 py-3 backdrop-blur">
      <button
        onClick={() => toggle()}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/60",
          enabled
            ? "bg-ink-600 text-slate-100 hover:bg-ink-500"
            : "bg-red-500/90 text-white hover:bg-red-500",
        )}
        aria-pressed={!enabled}
        aria-label={enabled ? "Mute microphone" : "Unmute microphone"}
        title={enabled ? "Mute (your mic is on)" : "Unmute (your mic is off)"}
      >
        {enabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <PushToTalk />
    </div>
  );
}
