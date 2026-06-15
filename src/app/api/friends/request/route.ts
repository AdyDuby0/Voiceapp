import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Sends a friend request to { userId }. If that person had already requested
// you, this accepts their request instead (so the two cases converge).
export async function POST(req: NextRequest) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const me = session.userId;

  let body: { userId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const other = String(body.userId ?? "");
  if (!other || other === me) {
    return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Is there already a relationship in either direction?
  const { data: existing } = await supabase
    .from("friend_requests")
    .select("id, requester_id, addressee_id, status")
    .or(
      `and(requester_id.eq.${me},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${me})`,
    )
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json({ status: "friend" });
    }
    // Pending. If they requested me, accept it; otherwise it's my own pending.
    if (existing.addressee_id === me) {
      await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", existing.id);
      return NextResponse.json({ status: "friend" });
    }
    return NextResponse.json({ status: "outgoing" });
  }

  const { error } = await supabase
    .from("friend_requests")
    .insert({ requester_id: me, addressee_id: other, status: "pending" });
  if (error) {
    if (error.code === "23503") {
      return NextResponse.json({ error: "That user doesn't exist." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not send request." }, { status: 500 });
  }
  return NextResponse.json({ status: "outgoing" });
}
