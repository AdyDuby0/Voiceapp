import { AccessToken } from "livekit-server-sdk";
import { getServerLiveKitConfig } from "./config";

// Mints a signed LiveKit join token. MUST run server-side only — it uses the
// API secret, which must never reach the browser. Called from /api/token.
export async function createJoinToken(
  roomCode: string,
  identity: string,
  displayName: string,
): Promise<string> {
  const { apiKey, apiSecret } = getServerLiveKitConfig();

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: displayName,
    ttl: "2h",
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
