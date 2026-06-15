import { NextRequest, NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Finds users by username prefix so you can start a DM. Requires being logged in.
export async function GET(req: NextRequest) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  // Strip to alphanumeric — usernames are alphanumeric, and this also prevents
  // SQL LIKE wildcard characters (% _) from leaking into the query.
  const q = (req.nextUrl.searchParams.get("q") ?? "").replace(/[^a-zA-Z0-9]/g, "");
  if (q.length < 1) {
    return NextResponse.json({ users: [] });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .ilike("username", `${q}%`)
    .neq("id", session.userId) // don't show yourself
    .limit(10);

  if (error) {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  const users = (data ?? []).map((u) => ({
    id: u.id,
    username: u.username,
    avatarUrl: u.avatar_url,
  }));
  return NextResponse.json({ users });
}
