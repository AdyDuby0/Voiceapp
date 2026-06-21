import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { pruneStaleRooms } from "@/lib/rooms";

// Scheduled cleanup of stale empty rooms. Triggered by Vercel Cron (see
// vercel.json). If CRON_SECRET is set, requests must carry it (Vercel Cron sends
// it automatically); if unset, the endpoint runs unauthenticated.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await pruneStaleRooms(getSupabaseAdmin());
    return NextResponse.json({ ok: true, deleted });
  } catch {
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
}
