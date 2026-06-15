"use client";

import { useRef, useState } from "react";
import { X, Upload, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, refresh, logout } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

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
