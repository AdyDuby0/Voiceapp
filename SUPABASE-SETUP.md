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
