// Typed access to environment configuration. Keeps the LiveKit secret strictly
// server-side: anything the browser needs must be prefixed NEXT_PUBLIC_.

export function getServerLiveKitConfig() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  // Falls back to the public URL so a single value works for local dev.
  const url =
    process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Missing LIVEKIT_API_KEY / LIVEKIT_API_SECRET. Copy .env.example to .env.local and fill them in.",
    );
  }

  return { apiKey, apiSecret, url };
}

// Browser-facing LiveKit websocket URL (e.g. ws://localhost:7880 in dev).
export function getPublicLiveKitUrl(): string {
  return process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
}
