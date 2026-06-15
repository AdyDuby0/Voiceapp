import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

// Logs a user in: looks them up case-insensitively, verifies the password, and
// sets the session cookie. Errors are deliberately vague ("invalid username or
// password") so we don't reveal whether a username exists.
export async function POST(req: NextRequest) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!username || !password) {
    return NextResponse.json(
      { error: "Enter your username and password." },
      { status: 400 },
    );
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Usernames are alphanumeric, so ilike acts as a safe case-insensitive match.
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password_hash, avatar_url")
    .ilike("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not log in." }, { status: 500 });
  }

  const invalid = NextResponse.json(
    { error: "Invalid username or password." },
    { status: 401 },
  );
  if (!user) return invalid;

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return invalid;

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
  });
  const res = NextResponse.json({
    user: { id: user.id, username: user.username, avatarUrl: user.avatar_url },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
