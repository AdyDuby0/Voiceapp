import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DmProvider } from "@/components/dm/DmProvider";
import { CursorGlow } from "@/components/CursorGlow";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://voiceapp-black.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Voiceapp — talk together, instantly",
  description:
    "Join a voice and text room by link — no install, no account. A friendlier way to hang out by voice.",
  openGraph: {
    title: "Voiceapp — talk together, instantly",
    description: "Join a voice and text room by link — no install, no account.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voiceapp — talk together, instantly",
    description: "Join a voice and text room by link — no install, no account.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
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
        <AuthProvider>
          <DmProvider>{children}</DmProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
