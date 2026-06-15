import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CursorGlow } from "@/components/CursorGlow";

export const metadata: Metadata = {
  title: "Voiceapp — talk together, instantly",
  description:
    "Join a voice and text room by link — no install, no account. A friendlier way to hang out by voice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CursorGlow />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
