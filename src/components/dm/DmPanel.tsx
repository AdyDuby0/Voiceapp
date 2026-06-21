"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Search, UserPlus, Check, Clock } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ConversationView } from "./ConversationView";
import { useDm } from "./DmProvider";
import { isOnline } from "@/lib/types";
import type { FriendsData, FriendStatus, UserSummary } from "@/lib/types";

const EMPTY: FriendsData = { friends: [], incoming: [], outgoing: [] };

export function DmPanel({ onClose }: { onClose: () => void }) {
  const { isUnread, markRead } = useDm();
  const [activeUser, setActiveUser] = useState<UserSummary | null>(null);
  const [data, setData] = useState<FriendsData>(EMPTY);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);

  const loadFriends = useCallback(async () => {
    try {
      const res = await fetch("/api/friends", { cache: "no-store" });
      if (!res.ok) return;
      const d = await res.json();
      setData({
        friends: d.friends ?? [],
        incoming: d.incoming ?? [],
        outgoing: d.outgoing ?? [],
      });
    } catch {
      // ignore
    }
  }, []);

  // Refresh friends/requests while the list is visible.
  useEffect(() => {
    if (activeUser) return;
    loadFriends();
    const timer = setInterval(loadFriends, 5000);
    return () => clearInterval(timer);
  }, [activeUser, loadFriends]);

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
        const d = await res.json();
        setResults(d.users ?? []);
      } catch {
        if (active) setResults([]);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  function statusOf(userId: string): FriendStatus {
    if (data.friends.some((f) => f.id === userId)) return "friend";
    if (data.incoming.some((i) => i.user.id === userId)) return "incoming";
    if (data.outgoing.includes(userId)) return "outgoing";
    return "none";
  }

  async function addFriend(userId: string) {
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    loadFriends();
  }

  async function respond(requestId: string, action: "accept" | "decline") {
    await fetch("/api/friends/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    loadFriends();
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
          <ConversationView partner={activeUser} onBack={() => setActiveUser(null)} />
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
                placeholder="Find people to add as friends…"
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {query.trim() ? (
                // --- Search results ---
                results.length > 0 ? (
                  results.map((u) => {
                    const status = statusOf(u.id);
                    return (
                      <Row key={u.id} user={u}>
                        {status === "friend" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActiveUser(u);
                              markRead(u.id);
                            }}
                          >
                            Message
                          </Button>
                        ) : status === "outgoing" ? (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock size={13} /> Requested
                          </span>
                        ) : status === "incoming" ? (
                          <Button size="sm" onClick={() => addFriend(u.id)}>
                            <Check size={14} /> Accept
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => addFriend(u.id)}>
                            <UserPlus size={14} /> Add
                          </Button>
                        )}
                      </Row>
                    );
                  })
                ) : (
                  <p className="mt-6 text-center text-sm text-slate-500">No users found.</p>
                )
              ) : (
                // --- Default view: requests + friends ---
                <>
                  {data.incoming.length > 0 && (
                    <div className="mb-2">
                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Friend requests
                      </p>
                      {data.incoming.map((req) => (
                        <Row key={req.requestId} user={req.user}>
                          <div className="flex gap-1.5">
                            <Button size="sm" onClick={() => respond(req.requestId, "accept")}>
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => respond(req.requestId, "decline")}
                            >
                              Decline
                            </Button>
                          </div>
                        </Row>
                      ))}
                    </div>
                  )}

                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Friends
                    {data.friends.filter((f) => isOnline(f.lastSeen)).length >
                      0 && (
                      <span className="ml-1.5 text-emerald-400">
                        · {data.friends.filter((f) => isOnline(f.lastSeen)).length}{" "}
                        online
                      </span>
                    )}
                  </p>
                  {data.friends.length > 0 ? (
                    [...data.friends]
                      .sort(
                        (a, b) =>
                          Number(isOnline(b.lastSeen)) -
                          Number(isOnline(a.lastSeen)),
                      )
                      .map((f) => {
                        const online = isOnline(f.lastSeen);
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              setActiveUser(f);
                              markRead(f.id);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                          >
                            <span className="relative shrink-0">
                              <Avatar name={f.username} src={f.avatarUrl} size={40} />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-800 ${
                                  online ? "bg-emerald-500" : "bg-slate-600"
                                }`}
                                title={online ? "Online" : "Offline"}
                              />
                            </span>
                            <span className="flex-1 truncate text-sm font-medium text-slate-100">
                              {f.username}
                            </span>
                            {isUnread(f.id) && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                            )}
                          </button>
                        );
                      })
                  ) : (
                    <p className="mt-4 px-4 text-center text-sm text-slate-500">
                      No friends yet. Search above to add someone.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  user,
  children,
}: {
  user: UserSummary;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
      <Avatar name={user.username} src={user.avatarUrl} size={40} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100">
        {user.username}
      </span>
      {children}
    </div>
  );
}
