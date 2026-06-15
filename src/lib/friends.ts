import type { SupabaseClient } from "@supabase/supabase-js";

// True if the two users are accepted friends (friendship is symmetric, so we
// check a row in either direction).
export async function areFriends(
  supabase: SupabaseClient,
  a: string,
  b: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${a},addressee_id.eq.${b}),and(requester_id.eq.${b},addressee_id.eq.${a})`,
    )
    .limit(1);
  return !!(data && data.length > 0);
}
