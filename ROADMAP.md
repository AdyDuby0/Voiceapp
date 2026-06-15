# Voiceapp Roadmap — Accounts, Rooms, Profiles & DMs

Planned next phase of work. Captured for later — **not yet built or deployed.**

## Decisions made

- **Sign-in model: Hybrid.** Guests can still join by link with just a typed name
  (the original "no account" magic stays). Creating an account unlocks the extras:
  a custom profile picture, owning/moderating rooms, and DMs.
- **Auth: username + password (NOT Google).** Sign up with a username, a password,
  and a password confirmation. Usernames are unique (enforced by the database).
  Google sign-in is dropped.
- **Backend: Supabase (all-in-one)** — provides the database (users, rooms, DMs),
  file storage (avatars), and realtime (for DMs) in a single service.
- **Sequencing: phased, DMs last.** Each phase ships on its own.

### Done
- **Footer + legal + contact + donation.** Below-the-fold footer (thin sliver
  peeks on load), Privacy Policy and Terms pages, contact email
  (voice.app.sup@gmail.com), and a Ko-fi donation button. No backend required.
- **Phase 1 — Accounts (username/password).** Top-right "Create account / Log in"
  button + modal (username, password, confirm). Supabase-backed register/login/
  logout/me routes with bcrypt-hashed passwords, unique case-insensitive
  usernames, and a signed httpOnly session cookie (jose). Guests still join freely.
- **Phase 3 — Profile pictures.** Click the account chip → profile panel → upload
  a picture (PNG/JPEG/WebP/GIF, max 2 MB). Stored in a public Supabase Storage
  bucket (auto-created on first upload — no manual setup). Avatar component shows
  the image with an initials fallback.
- **Phase 4 — Direct messages.** Top-right Messages button (logged-in users) →
  panel with a user search + conversation inbox → per-person chat. Delivery is by
  short-interval polling (works with our custom auth; no Supabase Realtime/RLS
  needed). Needs the `messages` table (see SUPABASE-SETUP.md).
- **Room identity for members.** Logged-in users join rooms as their account
  (username + profile picture, via LiveKit participant metadata). Guests still
  type a name.
- **Friend-gated DMs.** `friend_requests` table; add/accept/decline flow in the
  Messages panel; sending a DM requires an accepted friendship.
- **Room ownership, capacity & kick.** Logged-in creators own their room and can
  set a capacity; the token route enforces capacity + bans. Owners see a remove
  control on each participant tile (members are also banned from rejoining).
  Needs the `rooms` and `room_bans` tables (see SUPABASE-SETUP.md).
- **Editable in-room capacity.** Create-room form and an owner-only header
  control use an Unlimited/Custom toggle. Lowering the cap below the current head
  count prompts to confirm, then removes the required number of people at random
  (never the owner). Route: POST /api/rooms/[code]/capacity.
- **Landing tweaks.** Buy Me a Coffee donation link, "Updates" changelog button
  (top-left), fixed the clipped title, removed the badge above it.

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
- Create a Supabase project; add a **users** table (unique `username`, hashed
  `password`, `avatar_url`).
- Top-right "Create account / Log in" entry point on the landing page (the rest of
  the page stays identical). Sign-up form: username + password + confirm password.
- Server routes register (reject duplicate usernames, hash the password) and log in
  (verify, issue a session). Passwords are never stored in plain text.
- The browser remembers the logged-in user (session); members get a persistent
  identity; guests untouched.
- Files: Supabase client helper, `/api/auth/register` + `/api/auth/login` routes,
  account button + modal UI, and room join logic so a member's saved profile flows
  in instead of a typed name.

### Phase 2 — Capacity limit + owner kick
- Make rooms real records. On create, the member picks a **max size**; we set it on
  the LiveKit room (LiveKit rejects the overflow person) and store cap + owner.
- Owner sees a **"remove"** button on each participant tile → server route verifies
  ownership → tells LiveKit to remove the person → optionally add to **room_bans**.
- Files: token route (capacity + ban checks), new "create room" route, new "kick"
  route, participant tile UI.

### Phase 3 — Custom profile picture
- Members **upload** a profile picture (no Google photo to fall back on now).
- Image → Supabase Storage; URL saved on the user row.
- The existing `Avatar` component learns to show a photo when present (keeps the
  colored-initials fallback for guests and members without a picture).
- Files: small profile/settings screen, avatar component.

### Phase 4 — Private messages (last; the big one)
- Built on top of accounts. DMs stored in the database (history survives, reaches
  offline users); Supabase Realtime pushes new messages to the recipient instantly,
  even outside any voice room.
- Simple inbox/conversation UI. **Members only** (can't DM a nameless guest) — which
  is why accounts come first.

## Setup needed (when we start the account system)

- Free **Supabase** account + project (database URL + keys).
- New env vars (Supabase URL + keys) in `.env.local`, later in Vercel.
- One-time database table setup (users, rooms, bans, messages) — scripted into a
  single step.
- No Google / OAuth setup needed — auth is username + password.

## What does NOT change

Voice, text chat, join-by-link, the LiveKit Cloud deployment, and the whole guest
experience all keep working. This is a layer added on top, not a rebuild. Each phase
is independently shippable, and nothing deploys until approved.
