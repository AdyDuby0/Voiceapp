import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voiceapp — talk together, instantly",
  description:
    "A friendlier alternative to Discord and TeamSpeak. Join a voice and text room by link — no install, no account.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
