import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Heartbeat: marks the signed-in user as recently active. The client pings this
// on an interval; friends are shown "online" if their last_seen is recent.
export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("users")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", session.userId);
  } catch {
    // Presence is best-effort; ignore failures.
  }

  return NextResponse.json({ ok: true });
}
