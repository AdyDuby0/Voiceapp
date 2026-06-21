"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useDm } from "./DmProvider";
import { DmPanel } from "./DmPanel";

// Opens the direct-messages panel. Only shown to signed-in users. Shows an
// unread badge when there are new messages.
export function MessagesButton() {
  const { user, loading } = useAuth();
  const { unreadCount, requestPermission } = useDm();
  const [open, setOpen] = useState(false);

  if (loading || !user) return null;

  return (
    <>
      <button
        onClick={() => {
          requestPermission();
          setOpen(true);
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-800/70 text-slate-300 backdrop-blur transition-colors hover:bg-ink-700 hover:text-white"
        aria-label={
          unreadCount > 0 ? `Messages (${unreadCount} unread)` : "Messages"
        }
        title="Messages"
      >
        <MessageCircle size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && <DmPanel onClose={() => setOpen(false)} />}
    </>
  );
}
