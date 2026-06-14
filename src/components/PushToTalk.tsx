"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import { usePushToTalk } from "@/hooks/usePushToTalk";
import { cn } from "./ui/cn";

// Toggle for push-to-talk mode. When on, the user holds Space to transmit.
export function PushToTalk() {
  const [active, setActive] = useState(false);
  const talking = usePushToTalk(active);

  return (
    <button
      onClick={() => setActive((a) => !a)}
      className={cn(
        "flex h-12 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-glow/60",
        active
          ? talking
            ? "bg-emerald-500/90 text-white"
            : "bg-accent text-white"
          : "bg-ink-600 text-slate-300 hover:bg-ink-500",
      )}
      aria-pressed={active}
      title="Push-to-talk: hold Space to speak"
    >
      <Radio size={18} />
      {active ? (talking ? "Transmitting" : "Hold Space") : "Push-to-talk"}
    </button>
  );
}
