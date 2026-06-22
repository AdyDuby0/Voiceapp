"use client";

import { useState } from "react";
import { UserPlus, Crown } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { AuthModal } from "./AuthModal";
import { ProfileModal } from "./ProfileModal";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

// Top-right account control: a "Create account / Log in" button when signed out,
// or the user's avatar + name (click to open the profile panel) when signed in.
export function AccountButton() {
  const { user, loading } = useAuth();
  const [modalMode, setModalMode] = useState<"login" | "signup" | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-white/5" />;
  }

  if (user) {
    return (
      <>
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-800/70 py-1 pl-1 pr-3 backdrop-blur transition-colors hover:bg-ink-700"
          title="Profile"
        >
          <Avatar name={user.username} src={user.avatarUrl} size={28} />
          <span className="max-w-[8rem] truncate text-sm font-medium text-slate-100">
            {user.username}
          </span>
          {user.isPro && (
            <Crown
              size={14}
              className="shrink-0 text-amber-400"
              aria-label="Pro"
            />
          )}
        </button>
        {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setModalMode("signup")}
        className="backdrop-blur"
      >
        <UserPlus size={15} />
        Create account
      </Button>
      {modalMode && (
        <AuthModal
          initialMode={modalMode}
          onClose={() => setModalMode(null)}
        />
      )}
    </>
  );
}
