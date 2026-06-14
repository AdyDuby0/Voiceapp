# Voiceapp

A friendlier alternative to Discord and TeamSpeak: **join a voice + text room by
link — no install, no account.** TeamSpeak-grade voice with Discord-level polish.

Built with **Next.js (App Router) + TypeScript** and **LiveKit** for real-time
voice, presence, "who's speaking", and text chat.

## Features (MVP)

- 🎙️ Low-latency group **voice** chat
- 💬 In-room **text** chat
- 👥 Live **presence** + active-speaker indicator
- 🔗 **Join by link / room code** — no account
- 🎚️ Mute, push-to-talk, per-person volume

## Quick start

> **On Windows?** See [SETUP-WINDOWS.md](./SETUP-WINDOWS.md) for a beginner-friendly
> guide — after a one-time setup you just double-click `start-windows.bat`.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

The defaults work for local development. The `LIVEKIT_API_KEY` /
`LIVEKIT_API_SECRET` must match the keys in `livekit.yaml`.

### 3. Start the LiveKit server (needed for voice)

Requires Docker.

```bash
docker compose up
```

This runs `livekit/livekit-server` on `ws://localhost:7880`.

### 4. Start the app

```bash
npm run dev
```

Open <http://localhost:3000>.

## Testing voice with two people

1. Tab A: enter a name, click **Create a new room**, allow the microphone.
2. Copy the room link (or the room code).
3. Tab B (or a second device): enter a different name, **Join** with the same code.
4. Talk — **use headphones** on a single machine to avoid echo.

> **Note:** Microphone access only works over `http://localhost` or `https://`.
> Opening the app via a LAN IP (e.g. `http://192.168.x.x`) will silently block
> the mic.

## Deploying later

Swap the local Docker LiveKit server for [LiveKit Cloud](https://livekit.io/)
(free tier) — only the env URL/keys change, no code changes. Host the Next.js
app on Vercel, or bundle it as a desktop app with Tauri.

## Project layout

```
src/
  app/            # pages + API route (token minting)
  components/     # UI: room shell, participant tiles, chat, controls
  hooks/          # LiveKit connection, chat, push-to-talk, speakers
  lib/            # token helper, room codes, types, config
```
