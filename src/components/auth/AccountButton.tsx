"use client";

import { useState } from "react";
import { LogOut, UserPlus } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { AuthModal } from "./AuthModal";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

// Top-right account control: a "Log in / Sign up" button when signed out, or the
// user's avatar + name with a log-out option when signed in.
export function AccountButton() {
  const { user, loading, logout } = useAuth();
  const [modalMode, setModalMode] = useState<"login" | "signup" | null>(null);

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-white/5" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-800/70 py-1 pl-1 pr-2 backdrop-blur">
        <Avatar name={user.username} size={28} />
        <span className="max-w-[8rem] truncate text-sm font-medium text-slate-100">
          {user.username}
        </span>
        <button
          onClick={logout}
          className="ml-1 text-slate-400 transition-colors hover:text-white"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
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
