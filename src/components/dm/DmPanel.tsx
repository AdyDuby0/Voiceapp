"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { ConversationView } from "./ConversationView";
import type { ConversationSummary, UserSummary } from "@/lib/types";

export function DmPanel({ onClose }: { onClose: () => void }) {
  const [activeUser, setActiveUser] = useState<UserSummary | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);

  const loadInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/dm", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // ignore; user can reopen
    }
  }, []);

  // Refresh the inbox while the list is visible.
  useEffect(() => {
    if (activeUser) return;
    loadInbox();
    const timer = setInterval(loadInbox, 5000);
    return () => clearInterval(timer);
  }, [activeUser, loadInbox]);

  // Search users as you type.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        if (!res.ok || !active) return;
        const data = await res.json();
        setResults(data.users ?? []);
      } catch {
        if (active) setResults([]);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  function openConversation(user: UserSummary) {
    setQuery("");
    setResults([]);
    setActiveUser(user);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <h2 className="text-base font-semibold text-white">Messages</h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {activeUser ? (
          <ConversationView
            partner={activeUser}
            onBack={() => setActiveUser(null)}
          />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="relative p-3">
              <Search
                size={16}
                className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by username…"
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {query.trim() ? (
                results.length > 0 ? (
                  results.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      onClick={() => openConversation(u)}
                    />
                  ))
                ) : (
                  <p className="mt-6 text-center text-sm text-slate-500">
                    No users found.
                  </p>
                )
              ) : conversations.length > 0 ? (
                conversations.map((c) => (
                  <UserRow
                    key={c.user.id}
                    user={c.user}
                    subtitle={`${c.fromMe ? "You: " : ""}${c.lastMessage}`}
                    onClick={() => openConversation(c.user)}
                  />
                ))
              ) : (
                <p className="mt-8 px-4 text-center text-sm text-slate-500">
                  No conversations yet. Search for someone above to start one.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  subtitle,
  onClick,
}: {
  user: UserSummary;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
    >
      <Avatar name={user.username} src={user.avatarUrl} size={40} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-100">
          {user.username}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-slate-400">{subtitle}</p>
        )}
      </div>
    </button>
  );
}
