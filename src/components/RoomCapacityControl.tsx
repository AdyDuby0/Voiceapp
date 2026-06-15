"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { CapacitySelector } from "./CapacitySelector";
import { Button } from "./ui/Button";

// Owner-only capacity editor shown in the room header. Lowering the cap below
// the current head count prompts for confirmation, then removes people at random.
export function RoomCapacityControl({
  code,
  maxParticipants,
  onChange,
}: {
  code: string;
  maxParticipants: number | null;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [unlimited, setUnlimited] = useState(maxParticipants == null);
  const [limit, setLimit] = useState(
    maxParticipants ? String(maxParticipants) : "5",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleOpen() {
    if (!open) {
      // Reset the editor to the room's current setting each time it opens.
      setUnlimited(maxParticipants == null);
      setLimit(maxParticipants ? String(maxParticipants) : "5");
      setError(null);
    }
    setOpen((o) => !o);
  }

  async function post(max: number | null, confirm: boolean) {
    return fetch(`/api/rooms/${code}/capacity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxParticipants: max, confirm }),
    });
  }

  async function save() {
    setError(null);
    const max = unlimited ? null : Number(limit);
    if (!unlimited && (!Number.isFinite(max!) || max! < 2)) {
      setError("Capacity must be at least 2.");
      return;
    }

    setBusy(true);
    try {
      let res = await post(max, false);
      let data = await res.json();

      if (res.ok && data.needsConfirm) {
        const n = data.toRemove as number;
        const ok = window.confirm(
          `This room has ${data.currentCount} people. Setting the limit to ${max} will remove ${n} ${n === 1 ? "person" : "people"} at random. Continue?`,
        );
        if (!ok) {
          setBusy(false);
          return;
        }
        res = await post(max, true);
        data = await res.json();
      }

      if (!res.ok) {
        setError(data.error ?? "Could not update capacity.");
        return;
      }
      onChange();
      setOpen(false);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-ink-600 px-2.5 text-sm text-slate-200 transition-colors hover:bg-ink-500"
        title="Edit room capacity"
      >
        <Users size={14} />
        {maxParticipants == null ? "Unlimited" : `Max ${maxParticipants}`}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-white/10 bg-ink-800 p-3 shadow-2xl">
          <p className="mb-2 text-xs font-medium text-slate-400">Room capacity</p>
          <CapacitySelector
            unlimited={unlimited}
            setUnlimited={setUnlimited}
            limit={limit}
            setLimit={setLimit}
          />
          {error && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <Button size="sm" className="mt-3 w-full" disabled={busy} onClick={save}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
