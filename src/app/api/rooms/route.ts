import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeRoomCode, isValidRoomCode } from "@/lib/roomCode";

// Registers an owned room. Only logged-in users can own a room (which is what
// makes capacity limits and kicking possible). Guests skip this and create
// basic, ownerless rooms by just navigating to a code.
export async function POST(req: NextRequest) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  let body: { code?: unknown; maxParticipants?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const code = normalizeRoomCode(String(body.code ?? ""));
  if (!isValidRoomCode(code)) {
    return NextResponse.json({ error: "Invalid room code." }, { status: 400 });
  }

  // null = no limit; otherwise clamp to a sane range.
  let maxParticipants: number | null = null;
  if (body.maxParticipants != null && body.maxParticipants !== "") {
    const n = Number(body.maxParticipants);
    if (!Number.isFinite(n) || n < 2 || n > 100) {
      return NextResponse.json(
        { error: "Capacity must be between 2 and 100." },
        { status: 400 },
      );
    }
    maxParticipants = Math.floor(n);
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Don't let someone take over a code already owned by another user.
  const { data: existing } = await supabase
    .from("rooms")
    .select("owner_id")
    .eq("code", code)
    .maybeSingle();
  if (existing && existing.owner_id !== session.userId) {
    return NextResponse.json(
      { error: "That room code is taken. Try creating again." },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("rooms")
    .upsert({ code, owner_id: session.userId, max_participants: maxParticipants });
  if (error) {
    return NextResponse.json({ error: "Could not create the room." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, code });
}
