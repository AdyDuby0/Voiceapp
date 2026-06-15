import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Responds to an incoming friend request: accept it, or decline (which removes
// the request so it can be re-sent later).
export async function POST(req: NextRequest) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const me = session.userId;

  let body: { requestId?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const requestId = String(body.requestId ?? "");
  const action = String(body.action ?? "");
  if (!requestId || (action !== "accept" && action !== "decline")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Only the addressee of a still-pending request may respond.
  const { data: reqRow } = await supabase
    .from("friend_requests")
    .select("id, addressee_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!reqRow || reqRow.addressee_id !== me || reqRow.status !== "pending") {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (action === "accept") {
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);
  } else {
    await supabase.from("friend_requests").delete().eq("id", requestId);
  }

  return NextResponse.json({ ok: true });
}
