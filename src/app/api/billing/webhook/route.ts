import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

// Stripe webhook: keeps each user's Pro status in sync with their subscription.
// Requires the raw request body for signature verification.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "Not configured." }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  async function setProByCustomer(
    customerId: string,
    isPro: boolean,
    until: number | null,
  ) {
    await supabase
      .from("users")
      .update({
        is_pro: isPro,
        pro_until: until ? new Date(until * 1000).toISOString() : null,
      })
      .eq("stripe_customer_id", customerId);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const active = sub.status === "active" || sub.status === "trialing";
        // In recent Stripe API versions the period end lives on the line item.
        const until = sub.items?.data?.[0]?.current_period_end ?? null;
        await setProByCustomer(String(sub.customer), active, until);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await setProByCustomer(String(sub.customer), false, null);
        break;
      }
      default:
        break;
    }
  } catch {
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
