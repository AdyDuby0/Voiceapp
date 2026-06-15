import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { areFriends } from "@/lib/friends";

const MAX_BODY = 2000;

// Matches messages exchanged between the two users, in either direction.
function betweenFilter(me: string, other: string) {
  return `and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`;
}

function mapMessage(m: {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}) {
  return {
    id: m.id,
    senderId: m.sender_id,
    recipientId: m.recipient_id,
    body: m.body,
    createdAt: m.created_at,
  };
}

// GET: the conversation with `userId`. `?since=<ISO>` returns only newer
// messages (used for lightweight polling). Also returns the partner's profile.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { userId: other } = await params;
  const me = session.userId;
  const since = req.nextUrl.searchParams.get("since");

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let query = supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, created_at")
    .or(betweenFilter(me, other))
    .order("created_at", { ascending: true })
    .limit(500);
  if (since) query = query.gt("created_at", since);

  const { data: messages, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Could not load conversation." }, { status: 500 });
  }

  // Partner profile (skip on incremental polls to save a query).
  let partner = null;
  if (!since) {
    const { data: u } = await supabase
      .from("users")
      .select("id, username, avatar_url")
      .eq("id", other)
      .maybeSingle();
    if (u) partner = { id: u.id, username: u.username, avatarUrl: u.avatar_url };
  }

  return NextResponse.json({ messages: (messages ?? []).map(mapMessage), partner });
}

// POST: send a message to `userId`.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }
  const { userId: other } = await params;
  const me = session.userId;

  if (other === me) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }

  let body: { body?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const text = String(body.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Message is empty." }, { status: 400 });
  }
  if (text.length > MAX_BODY) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // You can only message accepted friends.
  if (!(await areFriends(supabase, me, other))) {
    return NextResponse.json(
      { error: "You can only message friends. Send a friend request first." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: me, recipient_id: other, body: text })
    .select("id, sender_id, recipient_id, body, created_at")
    .single();

  if (error) {
    // 23503 = foreign key violation (recipient doesn't exist).
    if (error.code === "23503") {
      return NextResponse.json({ error: "That user no longer exists." }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }

  return NextResponse.json({ message: mapMessage(data) });
}
