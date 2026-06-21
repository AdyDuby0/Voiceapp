import type { MetadataRoute } from "next";

// Web app manifest — makes Voiceapp installable to the home screen / desktop.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voiceapp",
    short_name: "Voiceapp",
    description: "Talk together, instantly — no install, no account.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
