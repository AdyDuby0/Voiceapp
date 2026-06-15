import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Returns the signed-in user's friends, incoming requests (to accept/decline),
// and outgoing pending requests (so the UI can show "Requested").
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const me = session.userId;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: rows, error } = await supabase
    .from("friend_requests")
    .select("id, requester_id, addressee_id, status")
    .or(`requester_id.eq.${me},addressee_id.eq.${me}`);

  if (error) {
    return NextResponse.json({ error: "Could not load friends." }, { status: 500 });
  }

  const friendIds: string[] = [];
  const incoming: { requestId: string; userId: string }[] = [];
  const outgoing: string[] = [];

  for (const r of rows ?? []) {
    const other = r.requester_id === me ? r.addressee_id : r.requester_id;
    if (r.status === "accepted") {
      friendIds.push(other);
    } else if (r.status === "pending") {
      if (r.addressee_id === me) incoming.push({ requestId: r.id, userId: r.requester_id });
      else outgoing.push(r.addressee_id);
    }
  }

  // Look up profiles for everyone referenced.
  const ids = [...new Set([...friendIds, ...incoming.map((i) => i.userId)])];
  const profiles = new Map<
    string,
    { id: string; username: string; avatar_url: string | null }
  >();
  if (ids.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, username, avatar_url")
      .in("id", ids);
    for (const u of users ?? []) profiles.set(u.id, u);
  }

  const toSummary = (id: string) => {
    const u = profiles.get(id);
    return u
      ? { id: u.id, username: u.username, avatarUrl: u.avatar_url }
      : null;
  };

  return NextResponse.json({
    friends: friendIds.map(toSummary).filter(Boolean),
    incoming: incoming
      .map((i) => {
        const user = toSummary(i.userId);
        return user ? { requestId: i.requestId, user } : null;
      })
      .filter(Boolean),
    outgoing,
  });
}
