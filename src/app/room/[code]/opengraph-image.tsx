import { ImageResponse } from "next/og";
import { normalizeRoomCode } from "@/lib/roomCode";

export const runtime = "edge";
export const alt = "Join a Voiceapp room";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Per-room rich-preview image showing the room code — what people see when a
// room link is shared.
export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const room = normalizeRoomCode(code);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          backgroundImage:
            "radial-gradient(60% 60% at 80% 100%, rgba(129,140,248,0.3), transparent 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, color: "#cbd5e1" }}>
          Join the conversation
        </div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            letterSpacing: 14,
            marginTop: 12,
            color: "#a5b4fc",
          }}
        >
          {room}
        </div>
        <div style={{ fontSize: 34, color: "#94a3b8", marginTop: 16 }}>
          on Voiceapp · no install needed
        </div>
      </div>
    ),
    { ...size },
  );
}
