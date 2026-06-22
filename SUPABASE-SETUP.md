# Supabase setup (for accounts, profile pictures & DMs)

The account system needs a database that lives online. We use **Supabase** (free).
This is a one-time, ~10 minute setup. Do it once and everything account-related
works locally and when deployed.

> 🔒 **Security:** Your `service_role` key and `AUTH_SECRET` are secrets. Put them
> only in your local `.env.local` (and later in Vercel). **Never paste them into
> chat, screenshots, or commits.** When you're done, just tell me "Supabase is
> set up" — I don't need the actual keys.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> and sign up (free).
2. Click **New project**. Give it a name (e.g. `voiceapp`), set a database
   password (save it somewhere), pick the closest region, and create it.
3. Wait ~1–2 minutes for it to finish provisioning.

## 2. Get your API keys

In the project: **Settings → API**. Copy these three values:

| In Supabase | Goes into env var |
| --- | --- |
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **Project API keys → `anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Project API keys → `service_role` `secret`** | `SUPABASE_SERVICE_ROLE_KEY` |

## 3. Create the accounts table

In the project: **SQL Editor → New query**, paste this, and click **Run**:

```sql
-- Users for username/password accounts.
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null,
  password_hash text not null,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- Usernames are unique, case-insensitively (so "Alex" and "alex" can't both exist).
create unique index if not exists users_username_lower_idx
  on public.users (lower(username));
```

(Tables for rooms, bans, and DMs get added in their later phases — one short
script each.)

### Direct messages table (for the DM feature)

When you're ready to use direct messages, run this second script the same way
(**SQL Editor → New query → Run**):

```sql
-- Direct messages between two users.
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now()
);

-- Indexes for fast conversation lookups in both directions.
create index if not exists messages_pair_idx
  on public.messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx
  on public.messages (recipient_id, created_at);
```

### Friends + rooms tables (friend-gated DMs, room capacity & kicking)

Run this once for the friend system, room capacity limits, and the kick feature:

```sql
-- Friend requests / friendships (status: pending | accepted).
create table if not exists public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  addressee_id uuid not null references public.users(id) on delete cascade,
  status       text not null default 'pending',
  created_at   timestamptz not null default now(),
  unique (requester_id, addressee_id)
);
create index if not exists friend_requests_addressee_idx
  on public.friend_requests (addressee_id, status);

-- Owned rooms (capacity + moderation). max_participants null = no limit.
create table if not exists public.rooms (
  code             text primary key,
  owner_id         uuid not null references public.users(id) on delete cascade,
  max_participants int,
  created_at       timestamptz not null default now()
);

-- People removed/banned from a room (can't rejoin).
create table if not exists public.room_bans (
  room_code  text not null,
  user_id    uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (room_code, user_id)
);
```

### Presence (online/offline for friends)

Adds a `last_seen` column the app updates via a heartbeat:

```sql
alter table public.users add column if not exists last_seen timestamptz;
```

### Room auto-cleanup

Adds the activity timestamp used to delete empty rooms ~1 hour after the last
person leaves:

```sql
alter table public.rooms add column if not exists last_active_at timestamptz default now();
```

### Pro subscriptions (Stripe)

Adds the columns that track each user's Voiceapp Pro status:

```sql
alter table public.users add column if not exists stripe_customer_id text;
alter table public.users add column if not exists is_pro boolean not null default false;
alter table public.users add column if not exists pro_until timestamptz;
```

See **STRIPE-SETUP.md** for the Stripe side (product, price, webhook, env vars).

### 🔒 Lock down the tables (run this — important)

The app only ever reads/writes the database from the server using the
**service-role key**, which **bypasses Row-Level Security**. So enabling RLS with
**no policies** blocks all direct access via the public anon key while leaving the
app fully working. Run this once after creating the tables above:

```sql
-- Enable Row-Level Security on every table. No policies = deny all direct
-- (anon/authenticated) access; the server's service-role key still has full
-- access, so the app is unaffected.
alter table public.users          enable row level security;
alter table public.messages       enable row level security;
alter table public.friend_requests enable row level security;
alter table public.rooms          enable row level security;
alter table public.room_bans      enable row level security;
```

> After running this, sanity-check that the app still works (sign in, send a
> message). It should — the server uses the service-role key, which ignores RLS.

## 4. Fill in your local env file

Open `.env.local` (copy it from `.env.example` if you haven't) and set:

```
NEXT_PUBLIC_SUPABASE_URL=...        # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon public key
SUPABASE_SERVICE_ROLE_KEY=...       # service_role secret key
AUTH_SECRET=...                     # see below
```

Generate a random `AUTH_SECRET` (used to sign login sessions) by running this in
your terminal and pasting the result:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 5. (Later) Add the same vars to Vercel

When you next deploy, add those four variables under **Vercel → Settings →
Environment Variables** too, then redeploy. (Not needed just to test locally.)

---

## Done?

That's it. Tell me **"Supabase is set up"** and I'll build sign-up and login so
creating an account actually works — unique usernames, hashed passwords, and the
app remembering who you are.
