import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  hashPassword,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";
import { validateUsername, validatePassword } from "@/lib/validation";

// Creates a new account: validates input, enforces unique usernames, stores a
// bcrypt-hashed password, and logs the user in by setting the session cookie.
export async function POST(req: NextRequest) {
  let body: { username?: unknown; password?: unknown; confirmPassword?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  const usernameError = validateUsername(username);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
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

  const password_hash = await hashPassword(password);
  const { data, error } = await supabase
    .from("users")
    .insert({ username, password_hash })
    .select("id, username, avatar_url")
    .single();

  if (error) {
    // 23505 = unique_violation (the case-insensitive username index).
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 },
    );
  }

  const token = await createSessionToken({
    userId: data.id,
    username: data.username,
  });
  const res = NextResponse.json({
    user: { id: data.id, username: data.username, avatarUrl: data.avatar_url },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
