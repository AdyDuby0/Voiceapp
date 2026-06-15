import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRoomService } from "@/lib/livekit";
import { normalizeRoomCode } from "@/lib/roomCode";

// Removes a participant from a room. Only the room owner may do this. Members
// (identity "u_<userId>") are also banned so they can't rejoin; guests are
// removed but can't be persistently banned (no account to key on).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { code: raw } = await params;
  const code = normalizeRoomCode(raw);

  let body: { identity?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const identity = String(body.identity ?? "");
  if (!identity) {
    return NextResponse.json({ error: "No participant specified." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Only the owner may kick.
  const { data: room } = await supabase
    .from("rooms")
    .select("owner_id")
    .eq("code", code)
    .maybeSingle();
  if (!room || room.owner_id !== session.userId) {
    return NextResponse.json({ error: "Only the room owner can do that." }, { status: 403 });
  }

  try {
    await getRoomService().removeParticipant(code, identity);
  } catch {
    return NextResponse.json({ error: "Could not remove that person." }, { status: 500 });
  }

  // Persistently ban members so they can't rejoin.
  if (identity.startsWith("u_")) {
    const bannedUserId = identity.slice(2);
    await supabase
      .from("room_bans")
      .upsert({ room_code: code, user_id: bannedUserId });
  }

  return NextResponse.json({ ok: true });
}
