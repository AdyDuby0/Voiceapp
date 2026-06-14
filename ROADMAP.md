# Voiceapp Roadmap — Accounts, Rooms, Profiles & DMs

Planned next phase of work. Captured for later — **not yet built or deployed.**

## Decisions made

- **Sign-in model: Hybrid.** Guests can still join by link with just a typed name
  (the original "no account" magic stays). Signing in with Google unlocks the
  extras: a saved profile + avatar, owning/moderating rooms, and DMs.
- **Backend: Supabase (all-in-one)** — provides the database, Google login, file
  storage (avatars), and realtime (for DMs) in a single service.
- **Sequencing: phased, DMs last.** Each phase ships on its own.

## The new mental model

Two kinds of users:

- **Guests** — type a name, join by link. Same as today. No profile; can't own or
  moderate a room.
- **Members** — signed in with Google. Saved profile + avatar, can create *owned*
  rooms with a capacity limit + kick powers, and (later) can DM each other.

Clean rule: **joining stays open to guests; creating a *moderated* room requires
signing in** (you can only be "the owner who kicks people" if we know who you are).
Optionally, guests could still create quick ownerless rooms — small choice for later.

**Voice does not change. LiveKit stays exactly as is.** On join we just attach a
person's profile (name, avatar, "is owner?") to their LiveKit presence so the room
can draw avatars and show kick buttons to the right person.

## Data model (Supabase)

- **profiles** — one per signed-in user: `display_name`, `avatar_url` (defaults to
  Google photo), linked to their Google identity. This *is* the saved profile.
- **rooms** — `code`, `owner_id`, `max_participants`, `created_at`. Turns a room
  from a throwaway code into a real, owned record.
- **room_bans** — who's kicked-and-banned from which room (blocks rejoin).
- *(Phase 4)* **conversations** + **messages** — DM history.

## Phases

### Phase 1 — Accounts + profiles (foundation, the meatiest part)
- Create a Supabase project; enable Google login (Google Client ID/Secret live in
  the Supabase dashboard, not in our code).
- Add a "Sign in with Google" button to the landing page.
- On first sign-in, create a **profile** row from the Google name + photo.
- Members get a persistent identity; guests untouched.
- Files: new Supabase client helper, auth callback route, landing page, and the
  room join logic so a member's saved profile flows in instead of a typed name.

### Phase 2 — Capacity limit + owner kick
- Make rooms real records. On create, the member picks a **max size**; we set it on
  the LiveKit room (LiveKit rejects the overflow person) and store cap + owner.
- Owner sees a **"remove"** button on each participant tile → server route verifies
  ownership → tells LiveKit to remove the person → optionally add to **room_bans**.
- Files: token route (capacity + ban checks), new "create room" route, new "kick"
  route, participant tile UI.

### Phase 3 — Custom profile picture
- Members already get their Google photo; this adds an **upload** to replace it.
- Image → Supabase Storage; URL saved on the profile.
- The existing `Avatar` component learns to show a photo when present (keeps the
  colored-initials fallback for guests).
- Files: small profile/settings screen, avatar component.

### Phase 4 — Private messages (last; the big one)
- Built on top of accounts. DMs stored in the database (history survives, reaches
  offline users); Supabase Realtime pushes new messages to the recipient instantly,
  even outside any voice room.
- Simple inbox/conversation UI. **Members only** (can't DM a nameless guest) — which
  is why accounts come first.

## Setup needed (when we start)

- Free **Supabase** account + project (database URL + keys).
- **Google OAuth** app in Google Cloud Console (Client ID/Secret), pasted into
  Supabase — *not* into our code.
- New env vars (Supabase URL + keys) in `.env.local`, later in Vercel.
- One-time database table setup — scripted into a single step.

## What does NOT change

Voice, text chat, join-by-link, the LiveKit Cloud deployment, and the whole guest
experience all keep working. This is a layer added on top, not a rebuild. Each phase
is independently shippable, and nothing deploys until approved.
