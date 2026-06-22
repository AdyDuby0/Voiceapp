"use client";

import { useRef, useState } from "react";
import { X, Upload, LogOut, Crown, Check } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const PRO_PERKS = [
  "Keep your rooms permanently (no auto-delete)",
  "Bigger rooms & HD screen share",
  "A Pro badge on your profile",
  "Support the project ❤️",
];

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, refresh, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  // Redirect to Stripe Checkout (upgrade) or the billing portal (manage).
  async function billing(endpoint: "checkout" | "portal") {
    setError(null);
    setBillingBusy(true);
    try {
      const res = await fetch(`/api/billing/${endpoint}`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Billing is not available right now.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBillingBusy(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      await refresh(); // picks up the new avatar URL
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Avatar name={user.username} src={user.avatarUrl} size={88} />
          <p className="text-base font-semibold text-white">{user.username}</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />

        <Button
          variant="secondary"
          size="lg"
          className="mt-5 w-full"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={16} />
          {busy ? "Uploading…" : "Change profile picture"}
        </Button>

        {error && (
          <p className="mt-3 animate-fade-in text-center text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Voiceapp Pro */}
        <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
          {user.isPro ? (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold text-accent-glow">
                <Crown size={16} />
                Voiceapp Pro — active
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                disabled={billingBusy}
                onClick={() => billing("portal")}
              >
                {billingBusy ? "Opening…" : "Manage subscription"}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Crown size={16} className="text-accent-glow" />
                Upgrade to Voiceapp Pro
              </div>
              <ul className="mt-2 space-y-1">
                {PRO_PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex gap-1.5 text-xs text-slate-300"
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-accent-glow" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className="mt-3 w-full"
                disabled={billingBusy}
                onClick={() => billing("checkout")}
              >
                {billingBusy ? "Opening…" : "Go Pro"}
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </div>
  );
}
