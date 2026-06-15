import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeRoomCode } from "@/lib/roomCode";

// Returns a room's owner + capacity (or null for basic/guest rooms). The room
// screen uses this to decide whether the current user can moderate.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await params;
  const code = normalizeRoomCode(raw);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ room: null });
  }

  const { data } = await supabase
    .from("rooms")
    .select("owner_id, max_participants")
    .eq("code", code)
    .maybeSingle();

  if (!data) return NextResponse.json({ room: null });
  return NextResponse.json({
    room: { ownerId: data.owner_id, maxParticipants: data.max_participants },
  });
}
