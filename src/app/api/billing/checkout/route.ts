import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe, stripePriceId, ensureStripeCustomer } from "@/lib/stripe";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://voiceapp-black.vercel.app";

// Starts a Stripe Checkout session for a Voiceapp Pro subscription.
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

  try {
    const customer = await ensureStripeCustomer(
      supabase,
      session.userId,
      session.username,
    );
    const checkout = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price: stripePriceId(), quantity: 1 }],
      success_url: `${siteUrl}/?pro=success`,
      cancel_url: `${siteUrl}/?pro=cancel`,
      metadata: { userId: session.userId },
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
