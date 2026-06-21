import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeRoomCode } from "@/lib/roomCode";
import { readSession } from "@/lib/auth";

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

// Deletes an owned room (owner only). Also clears its bans.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { code: raw } = await params;
  const code = normalizeRoomCode(raw);

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: room } = await supabase
    .from("rooms")
    .select("owner_id")
    .eq("code", code)
    .maybeSingle();
  if (!room || room.owner_id !== session.userId) {
    return NextResponse.json(
      { error: "Only the owner can delete this room." },
      { status: 403 },
    );
  }

  await supabase.from("room_bans").delete().eq("room_code", code);
  await supabase.from("rooms").delete().eq("code", code);
  return NextResponse.json({ ok: true });
}
