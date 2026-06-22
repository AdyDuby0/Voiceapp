# Stripe setup (for Voiceapp Pro subscriptions)

This enables the paid **Voiceapp Pro** tier. ~15 minutes.

> 🔒 Your Stripe secret key and webhook secret are secrets — put them only in
> `.env.local` and in Vercel's env vars. Never commit them or paste them in chat.

---

## 1. Create the product & price

1. Sign up / log in at <https://dashboard.stripe.com>. (Use **Test mode** while
   developing — toggle top-right.)
2. **Product catalog → Add product**: name it "Voiceapp Pro", add a **recurring**
   price (e.g. $5 / month). Save.
3. Copy the **Price ID** (looks like `price_...`) → this is `STRIPE_PRICE_ID`.

## 2. Get your API key

**Developers → API keys** → copy the **Secret key** (`sk_test_...`) →
`STRIPE_SECRET_KEY`.

## 3. Set up the webhook

The webhook keeps Pro status in sync when people subscribe/cancel.

1. **Developers → Webhooks → Add endpoint.**
2. Endpoint URL: `https://YOUR-SITE/api/billing/webhook`
3. Select events: `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
4. After creating it, copy the **Signing secret** (`whsec_...`) →
   `STRIPE_WEBHOOK_SECRET`.

For **local** testing, install the Stripe CLI and run:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

It prints a `whsec_...` to use as `STRIPE_WEBHOOK_SECRET` locally.

## 4. Add the database columns

Run the Pro-subscriptions SQL from **SUPABASE-SETUP.md** (adds
`stripe_customer_id`, `is_pro`, `pro_until` to `users`).

## 5. Fill in env vars

Local `.env.local` **and** Vercel → Settings → Environment Variables:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_SITE_URL=https://your-site   # http://localhost:3000 locally
```

## 6. Test it

1. Open your profile (top-right avatar) → **Go Pro**.
2. On the Stripe Checkout page use a **test card**: `4242 4242 4242 4242`, any
   future expiry, any CVC.
3. After paying you'll be redirected back; once the webhook fires you'll see the
   **Pro badge**, and your rooms stop auto-deleting.

## Going live

Switch Stripe to **Live mode**, recreate the product/price + webhook there, and
put the **live** keys in Vercel. Test mode and live mode have separate keys.
