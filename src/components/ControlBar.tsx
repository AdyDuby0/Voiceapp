"use client";

import { useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, ScreenShare, ScreenShareOff } from "lucide-react";
import { cn } from "./ui/cn";
import { PushToTalk } from "./PushToTalk";
import { DeviceSettings } from "./DeviceSettings";

// Bottom control bar: mic mute, screen share, push-to-talk, and device settings.
// Toggles use LiveKit's useTrackToggle so publish state stays authoritative.
export function ControlBar() {
  const { toggle, enabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });
  const screen = useTrackToggle({ source: Track.Source.ScreenShare });

  return (
    <div
      className="flex shrink-0 items-center justify-center gap-3 border-t border-white/10 bg-ink-800/80 px-5 pt-3 backdrop-blur"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
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

      <button
        onClick={() => screen.toggle()}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/60",
          screen.enabled
            ? "bg-accent text-white hover:bg-accent-soft"
            : "bg-ink-600 text-slate-100 hover:bg-ink-500",
        )}
        aria-pressed={screen.enabled}
        aria-label={screen.enabled ? "Stop sharing screen" : "Share screen"}
        title={screen.enabled ? "Stop sharing" : "Share your screen"}
      >
        {screen.enabled ? (
          <ScreenShareOff size={20} />
        ) : (
          <ScreenShare size={20} />
        )}
      </button>

      <PushToTalk />
      <DeviceSettings />
    </div>
  );
}
