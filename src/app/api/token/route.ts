import { NextRequest, NextResponse } from "next/server";
import { createJoinToken, getRoomService } from "@/lib/livekit";
import { getPublicLiveKitUrl } from "@/lib/config";
import { normalizeRoomCode, isValidRoomCode } from "@/lib/roomCode";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Token minting is intentionally server-only so the LiveKit secret stays out of
// the browser bundle. Logged-in users join as their account (username + avatar),
// taken from the session — not from anything the client sends. Guests join with
// the display name they typed.

export async function POST(req: NextRequest) {
  let body: { room?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const room = normalizeRoomCode(String(body.room ?? ""));
  if (!isValidRoomCode(room)) {
    return NextResponse.json({ error: "Invalid room code." }, { status: 400 });
  }

  const session = await readSession();

  let identity: string;
  let displayName: string;
  let avatarUrl: string | null = null;

  if (session) {
    // Authoritative identity from the account — ignore any client-sent name.
    displayName = session.username;
    identity = `u_${session.userId}`;
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("users")
        .select("avatar_url")
        .eq("id", session.userId)
        .maybeSingle();
      avatarUrl = data?.avatar_url ?? null;
    } catch {
      // Avatar is optional; proceed without it if the lookup fails.
    }
  } else {
    const name = String(body.name ?? "").trim().slice(0, 24);
    if (!name) {
      return NextResponse.json(
        { error: "A display name is required." },
        { status: 400 },
      );
    }
    displayName = name;
    // Unique per session so the same name can join from two tabs.
    identity = `${name}__${crypto.randomUUID().slice(0, 8)}`;
  }

  // For owned rooms, enforce bans and capacity. Basic/guest rooms have no record
  // and skip this entirely.
  try {
    const supabase = getSupabaseAdmin();
    const { data: roomRow } = await supabase
      .from("rooms")
      .select("max_participants")
      .eq("code", room)
      .maybeSingle();

    if (roomRow) {
      if (session) {
        const { data: ban } = await supabase
          .from("room_bans")
          .select("room_code")
          .eq("room_code", room)
          .eq("user_id", session.userId)
          .maybeSingle();
        if (ban) {
          return NextResponse.json(
            { error: "You have been removed from this room." },
            { status: 403 },
          );
        }
      }

      if (roomRow.max_participants) {
        try {
          const present = await getRoomService().listParticipants(room);
          const alreadyIn = present.some((p) => p.identity === identity);
          if (!alreadyIn && present.length >= roomRow.max_participants) {
            return NextResponse.json(
              { error: "This room is full." },
              { status: 403 },
            );
          }
        } catch {
          // Room not created in LiveKit yet (0 participants) — allow.
        }
      }

      // Mark the room active so the idle-cleanup clock restarts on each join.
      await supabase
        .from("rooms")
        .update({ last_active_at: new Date().toISOString() })
        .eq("code", room);
    }
  } catch {
    // Supabase not configured / unreachable — fall back to no enforcement.
  }

  try {
    const token = await createJoinToken(room, identity, displayName, avatarUrl);
    return NextResponse.json({ token, url: getPublicLiveKitUrl(), identity });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
