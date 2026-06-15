import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { getServerLiveKitConfig } from "./config";

// Admin client for managing live rooms (listing participants, removing people).
// Uses the HTTP(S) form of the LiveKit URL (ws -> http, wss -> https).
export function getRoomService(): RoomServiceClient {
  const { apiKey, apiSecret, url } = getServerLiveKitConfig();
  const host = url.replace(/^ws/, "http");
  return new RoomServiceClient(host, apiKey, apiSecret);
}

// Mints a signed LiveKit join token. MUST run server-side only — it uses the
// API secret, which must never reach the browser. Called from /api/token.
// `avatarUrl` is embedded in participant metadata so others can show the picture.
export async function createJoinToken(
  roomCode: string,
  identity: string,
  displayName: string,
  avatarUrl?: string | null,
): Promise<string> {
  const { apiKey, apiSecret } = getServerLiveKitConfig();

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: displayName,
    ttl: "2h",
    metadata: JSON.stringify({ avatarUrl: avatarUrl ?? null }),
  });

  at.addGrant({
    roomJoin: true,
    room: roomCode,
    canPublish: true, // mic
    canSubscribe: true, // hear others
    canPublishData: true, // text chat over data channel
  });

  return at.toJwt();
}
