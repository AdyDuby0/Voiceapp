"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useAuth } from "./auth/AuthProvider";
import { Button } from "./ui/Button";

type Room = { code: string; maxParticipants: number | null; createdAt: string };

// Lists rooms the signed-in user owns so they can rejoin or delete them.
export function MyRooms() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setRooms([]);
      return;
    }
    try {
      const res = await fetch("/api/rooms/mine", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setRooms(data.rooms ?? []);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(code: string) {
    await fetch(`/api/rooms/${code}`, { method: "DELETE" });
    load();
  }

  if (!user || rooms.length === 0) return null;

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <p className="mb-2 text-xs font-medium text-slate-400">Your rooms</p>
      <ul className="space-y-1.5">
        {rooms.map((r) => (
          <li
            key={r.code}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-800 px-3 py-2"
          >
            <span className="font-mono text-sm tracking-widest text-slate-100">
              {r.code}
            </span>
            <span className="text-xs text-slate-500">
              {r.maxParticipants ? `max ${r.maxParticipants}` : "unlimited"}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => router.push(`/room/${r.code}`)}
              >
                Join
              </Button>
              <button
                onClick={() => remove(r.code)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/15 hover:text-red-400"
                aria-label={`Delete room ${r.code}`}
                title="Delete room"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
