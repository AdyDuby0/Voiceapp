import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Voiceapp — talk together, instantly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default rich-preview image used when the homepage link is shared.
export default function Image() {
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
            "radial-gradient(60% 60% at 20% 0%, rgba(99,102,241,0.35), transparent 60%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800 }}>Voiceapp</div>
        <div style={{ fontSize: 44, color: "#cbd5e1", marginTop: 12 }}>
          Talk together, instantly
        </div>
        <div style={{ fontSize: 30, color: "#a5b4fc", marginTop: 28 }}>
          No install · No account · Join by link
        </div>
      </div>
    ),
    { ...size },
  );
}
