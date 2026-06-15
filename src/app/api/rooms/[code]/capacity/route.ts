import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getRoomService } from "@/lib/livekit";
import { normalizeRoomCode } from "@/lib/roomCode";

// Updates an owned room's capacity (owner only). If the new limit is below the
// number of people currently in the room, the client must confirm; once
// confirmed we remove the required number of people at random (never the owner).
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

  let body: { maxParticipants?: unknown; confirm?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let maxParticipants: number | null = null;
  if (body.maxParticipants != null) {
    const n = Number(body.maxParticipants);
    if (!Number.isFinite(n) || n < 2 || n > 100) {
      return NextResponse.json(
        { error: "Capacity must be between 2 and 100, or unlimited." },
        { status: 400 },
      );
    }
    maxParticipants = Math.floor(n);
  }
  const confirm = body.confirm === true;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Owner check.
  const { data: room } = await supabase
    .from("rooms")
    .select("owner_id")
    .eq("code", code)
    .maybeSingle();
  if (!room || room.owner_id !== session.userId) {
    return NextResponse.json(
      { error: "Only the room owner can change capacity." },
      { status: 403 },
    );
  }

  // If shrinking below the current head count, confirm then remove at random.
  if (maxParticipants !== null) {
    let present: { identity: string }[] = [];
    try {
      present = await getRoomService().listParticipants(code);
    } catch {
      present = []; // room not live yet
    }

    if (present.length > maxParticipants) {
      const toRemove = present.length - maxParticipants;
      if (!confirm) {
        return NextResponse.json({
          needsConfirm: true,
          currentCount: present.length,
          toRemove,
        });
      }

      // Never remove the owner; pick the rest at random.
      const ownerIdentity = `u_${session.userId}`;
      const candidates = present
        .filter((p) => p.identity !== ownerIdentity)
        .sort(() => Math.random() - 0.5);
      for (let i = 0; i < toRemove && i < candidates.length; i++) {
        try {
          await getRoomService().removeParticipant(code, candidates[i].identity);
        } catch {
          // ignore individual removal failures
        }
      }
    }
  }

  const { error } = await supabase
    .from("rooms")
    .update({ max_participants: maxParticipants })
    .eq("code", code);
  if (error) {
    return NextResponse.json({ error: "Could not update capacity." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, maxParticipants });
}
