"use client";

import { useCallback, useEffect, useState } from "react";

export type RoomInfo = {
  ownerId: string | null;
  maxParticipants: number | null;
};

// Fetches a room's owner + capacity. `refresh` re-reads it after a change.
export function useRoomInfo(code: string) {
  const [info, setInfo] = useState<RoomInfo | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/rooms/${code}`, { cache: "no-store" });
      const d = await r.json();
      setInfo(
        d.room
          ? { ownerId: d.room.ownerId, maxParticipants: d.room.maxParticipants }
          : { ownerId: null, maxParticipants: null },
      );
    } catch {
      setInfo({ ownerId: null, maxParticipants: null });
    }
  }, [code]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { info, refresh };
}
