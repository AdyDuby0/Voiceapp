import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// The DM inbox: each person you've messaged with, plus a preview of the most
// recent message. Derived from your recent messages (no separate conversations
// table needed for the MVP).
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

  const { data: messages, error } = await supabase
    .from("messages")
    .select("sender_id, recipient_id, body, created_at")
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }

  // Keep only the latest message per conversation partner.
  const latestByPartner = new Map<
    string,
    { body: string; createdAt: string; fromMe: boolean }
  >();
  for (const m of messages ?? []) {
    const partnerId = m.sender_id === me ? m.recipient_id : m.sender_id;
    if (!latestByPartner.has(partnerId)) {
      latestByPartner.set(partnerId, {
        body: m.body,
        createdAt: m.created_at,
        fromMe: m.sender_id === me,
      });
    }
  }

  const partnerIds = [...latestByPartner.keys()];
  if (partnerIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .in("id", partnerIds);

  const userById = new Map((users ?? []).map((u) => [u.id, u]));

  const conversations = partnerIds
    .map((id) => {
      const u = userById.get(id);
      const last = latestByPartner.get(id)!;
      if (!u) return null;
      return {
        user: { id: u.id, username: u.username, avatarUrl: u.avatar_url },
        lastMessage: last.body,
        lastAt: last.createdAt,
        fromMe: last.fromMe,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ conversations });
}
