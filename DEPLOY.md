# Deploying Voiceapp (so anyone can join from any device)

Running locally only works on your own machine. To let friends join from other
devices over the internet, you need two things online:

1. The **app** itself — hosted on **Vercel**.
2. A **voice server** — hosted on **LiveKit Cloud** (the local Docker server only
   runs on your laptop and isn't reachable from the internet).

This guide connects the two. It requires **no code changes** — only environment
variables.

---

## Step 1 — Get free LiveKit Cloud credentials

1. Sign up at <https://cloud.livekit.io> (free tier).
2. Create a project (any name).
3. From the project page, copy these three values:
   - **WebSocket URL** — e.g. `wss://your-project-xxxx.livekit.cloud`
   - **API Key** — e.g. `APIxxxxxxxxxxxx`
   - **API Secret** — a long random string

LiveKit Cloud also provides TURN automatically, which is what lets people on
different networks actually connect.

---

## Step 2 — Add the credentials to Vercel

In your Vercel project: **Settings → Environment Variables**. Add these three for
the **Production** environment:

| Name | Value |
| --- | --- |
| `LIVEKIT_API_KEY` | your API Key |
| `LIVEKIT_API_SECRET` | your API Secret |
| `NEXT_PUBLIC_LIVEKIT_URL` | your `wss://…livekit.cloud` URL |

> The URL **must** start with `wss://` (secure WebSocket), not `ws://`, or the
> browser will block it on your HTTPS site.

`LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are server-only (used to mint join
tokens) and never reach the browser. `NEXT_PUBLIC_LIVEKIT_URL` is the address the
browser connects to.

---

## Step 3 — Redeploy (required)

Adding env vars does **not** update the live site by itself — `NEXT_PUBLIC_`
values are baked in at build time. Trigger a fresh build:

- Vercel → **Deployments** → **⋯** on the latest deployment → **Redeploy**.

(Pushing a new commit also triggers a redeploy.)

---

## Step 4 — Share the link

Once redeployed, send anyone the room link:

```
https://<your-app>.vercel.app/room/<ROOMCODE>
```

They open it on any device, enter a name, allow the microphone, and join. Vercel
serves the site over HTTPS, so the mic works on their device too.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| "Missing LIVEKIT_API_KEY / LIVEKIT_API_SECRET" | The two server vars aren't set in Vercel, or you haven't redeployed since adding them. |
| Joins but no audio / can't connect | Check `NEXT_PUBLIC_LIVEKIT_URL` is the `wss://` URL and that you **redeployed** after setting it. |
| Microphone blocked | Only works over HTTPS — use the `vercel.app` link, not an IP address. |
| Works for you, not for a friend on another network | Make sure you're using **LiveKit Cloud** (includes TURN), not a local/self-hosted server without TURN. |

---

## Local vs. deployed — quick reference

| | Voice server | `NEXT_PUBLIC_LIVEKIT_URL` |
| --- | --- | --- |
| **Local dev** | Docker (`docker compose up`) | `ws://localhost:7880` |
| **Deployed** | LiveKit Cloud | `wss://your-project.livekit.cloud` |
