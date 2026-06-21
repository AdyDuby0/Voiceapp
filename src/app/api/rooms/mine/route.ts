import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { pruneStaleRoomsThrottled } from "@/lib/rooms";

// Rooms owned by the signed-in user, so they can jump back into ones they made.
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Opportunistic (throttled) cleanup so stale rooms get pruned even without
  // the cron, and the list the owner sees is current.
  await pruneStaleRoomsThrottled(supabase);

  const { data } = await supabase
    .from("rooms")
    .select("code, max_participants, created_at")
    .eq("owner_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const rooms = (data ?? []).map((r) => ({
    code: r.code,
    maxParticipants: r.max_participants,
    createdAt: r.created_at,
  }));
  return NextResponse.json({ rooms });
}
