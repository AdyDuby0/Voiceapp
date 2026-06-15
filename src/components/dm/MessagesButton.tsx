"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { DmPanel } from "./DmPanel";

// Opens the direct-messages panel. Only shown to signed-in users (DMs are
// between accounts).
export function MessagesButton() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading || !user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-ink-800/70 text-slate-300 backdrop-blur transition-colors hover:bg-ink-700 hover:text-white"
        aria-label="Messages"
        title="Messages"
      >
        <MessageCircle size={18} />
      </button>
      {open && <DmPanel onClose={() => setOpen(false)} />}
    </>
  );
}
