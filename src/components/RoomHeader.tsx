"use client";

import { useState } from "react";
import { Check, Copy, LogOut, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { RoomCapacityControl } from "./RoomCapacityControl";

// Room header: shows the code and a one-click "copy link" — the join-by-link
// differentiator — plus a leave button. The owner gets a capacity editor.
export function RoomHeader({
  code,
  isOwner,
  maxParticipants,
  onCapacityChange,
}: {
  code: string;
  isOwner: boolean;
  maxParticipants: number | null;
  onCapacityChange: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/room/${code}`
        : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; ignore — user can copy the URL manually.
    }
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-slate-400">Room</span>
        <span className="font-mono text-lg tracking-widest text-white">
          {code}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isOwner ? (
          <RoomCapacityControl
            code={code}
            maxParticipants={maxParticipants}
            onChange={onCapacityChange}
          />
        ) : (
          maxParticipants != null && (
            <span className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-ink-700 px-2.5 text-sm text-slate-400">
              <Users size={14} />
              Max {maxParticipants}
            </span>
          )
        )}
        <Button variant="secondary" size="sm" onClick={copyLink}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied!" : "Copy link"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          aria-label="Leave room"
        >
          <LogOut size={15} />
          Leave
        </Button>
      </div>
    </header>
  );
}
