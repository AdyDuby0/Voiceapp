import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

// Server-side Stripe client. Lazy so the app builds without Stripe configured.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  if (!cached) cached = new Stripe(key);
  return cached;
}

export function stripePriceId(): string {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error("STRIPE_PRICE_ID is not set.");
  return id;
}

// Whether a user currently has an active Pro subscription. Driven by webhooks
// that set is_pro / pro_until; we double-check pro_until as a safety net.
export async function isUserPro(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("is_pro, pro_until")
    .eq("id", userId)
    .maybeSingle();
  if (!data?.is_pro) return false;
  if (data.pro_until && new Date(data.pro_until).getTime() < Date.now()) {
    return false;
  }
  return true;
}

// Returns the user's Stripe customer id, creating the customer if needed.
export async function ensureStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  username: string,
): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (data?.stripe_customer_id) return data.stripe_customer_id;

  const customer = await getStripe().customers.create({
    name: username,
    metadata: { userId, username },
  });
  await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);
  return customer.id;
}
