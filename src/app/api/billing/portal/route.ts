import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://voiceapp-black.vercel.app";

// Opens the Stripe customer portal so a Pro user can manage or cancel.
export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", session.userId)
    .maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No subscription found." },
      { status: 400 },
    );
  }

  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${siteUrl}/`,
    });
    return NextResponse.json({ url: portal.url });
  } catch {
    return NextResponse.json(
      { error: "Could not open billing portal." },
      { status: 500 },
    );
  }
}
