import type { SupabaseClient } from "@supabase/supabase-js";
import { getRoomService } from "./livekit";

const IDLE_MS = 60 * 60 * 1000; // delete a room ~1 hour after it goes empty

// Deletes owned rooms that have been idle (no new joins) for over an hour AND
// are currently empty in LiveKit. Rooms that are idle-by-timestamp but still
// occupied get their timestamp bumped so they're kept. Returns how many were
// deleted. (Guest/unowned rooms aren't tracked here — LiveKit closes those
// itself once empty.)
export async function pruneStaleRooms(
  supabase: SupabaseClient,
): Promise<number> {
  const cutoff = new Date(Date.now() - IDLE_MS).toISOString();

  const { data: stale } = await supabase
    .from("rooms")
    .select("code")
    .lt("last_active_at", cutoff)
    .limit(50);

  if (!stale || stale.length === 0) return 0;

  // If LiveKit isn't reachable we can't confirm emptiness — skip rather than
  // risk deleting an active room.
  let svc;
  try {
    svc = getRoomService();
  } catch {
    return 0;
  }

  let deleted = 0;
  for (const { code } of stale) {
    let occupied = false;
    try {
      const present = await svc.listParticipants(code);
      occupied = present.length > 0;
    } catch {
      occupied = false; // room not present in LiveKit = empty
    }

    if (occupied) {
      await supabase
        .from("rooms")
        .update({ last_active_at: new Date().toISOString() })
        .eq("code", code);
    } else {
      await supabase.from("room_bans").delete().eq("room_code", code);
      await supabase.from("rooms").delete().eq("code", code);
      deleted += 1;
    }
  }

  return deleted;
}

// Opportunistic cleanup that runs at most once every few minutes, so it can be
// called from a frequently-hit route without adding cost to every request.
let lastRun = 0;
export async function pruneStaleRoomsThrottled(
  supabase: SupabaseClient,
): Promise<void> {
  const now = Date.now();
  if (now - lastRun < 5 * 60 * 1000) return;
  lastRun = now;
  try {
    await pruneStaleRooms(supabase);
  } catch {
    // best-effort
  }
}
