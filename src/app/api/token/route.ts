import { NextRequest, NextResponse } from "next/server";
import { createJoinToken } from "@/lib/livekit";
import { getPublicLiveKitUrl } from "@/lib/config";
import { normalizeRoomCode, isValidRoomCode } from "@/lib/roomCode";

// Token minting is intentionally server-only so the LiveKit secret stays out of
// the browser bundle. The client POSTs a room code + display name and gets back
// a short-lived JWT plus the websocket URL it should connect to.

export async function POST(req: NextRequest) {
  let body: { room?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const room = normalizeRoomCode(String(body.room ?? ""));
  const name = String(body.name ?? "").trim().slice(0, 24);

  if (!isValidRoomCode(room)) {
    return NextResponse.json({ error: "Invalid room code." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json(
      { error: "A display name is required." },
      { status: 400 },
    );
  }

  // Unique per session so the same name can join from two tabs without colliding.
  const identity = `${name}__${crypto.randomUUID().slice(0, 8)}`;

  try {
    const token = await createJoinToken(room, identity, name);
    return NextResponse.json({ token, url: getPublicLiveKitUrl(), identity });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
