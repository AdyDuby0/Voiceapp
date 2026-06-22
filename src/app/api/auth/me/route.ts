import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// Returns the currently signed-in user (or null). Used by the client to know
// whether to show the account or the "log in" button. No cookie = no DB hit.
export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("users")
      .select("id, username, avatar_url, is_pro, pro_until")
      .eq("id", session.userId)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ user: null });
    }
    const isPro =
      !!data.is_pro &&
      (!data.pro_until || new Date(data.pro_until).getTime() > Date.now());
    return NextResponse.json({
      user: {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url,
        isPro,
      },
    });
  } catch {
    // If the DB is briefly unavailable, fall back to the verified session basics.
    return NextResponse.json({
      user: {
        id: session.userId,
        username: session.username,
        avatarUrl: null,
        isPro: false,
      },
    });
  }
}
