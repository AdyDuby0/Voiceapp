"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { loadReads, saveReads, type Reads } from "@/lib/dmReads";
import type { ConversationSummary } from "@/lib/types";

type DmState = {
  conversations: ConversationSummary[];
  unreadCount: number;
  isUnread: (userId: string) => boolean;
  markRead: (userId: string, ts?: number) => void;
  requestPermission: () => void;
  refresh: () => void;
};

const DmContext = createContext<DmState | null>(null);

function notify(username: string, body: string) {
  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    return;
  }
  try {
    new Notification(`New message from ${username}`, {
      body: body.slice(0, 120),
    });
  } catch {
    // ignore
  }
}

// Polls the DM inbox app-wide so the Messages button can show unread counts and
// fire browser notifications, even when the panel is closed.
export function DmProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [reads, setReads] = useState<Reads>({});
  // Highest message timestamp we've seen per partner, to de-dupe notifications.
  const seenRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setReads(loadReads());
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setConversations([]);
      return;
    }
    try {
      const res = await fetch("/api/dm", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const convos: ConversationSummary[] = data.conversations ?? [];

      // Fire a notification for genuinely new incoming messages.
      for (const c of convos) {
        const ts = new Date(c.lastAt).getTime();
        const prev = seenRef.current[c.user.id] ?? 0;
        if (prev !== 0 && !c.fromMe && ts > prev) {
          notify(c.user.username, c.lastMessage);
        }
        seenRef.current[c.user.id] = Math.max(prev, ts);
      }

      setConversations(convos);
    } catch {
      // transient; next poll retries
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    refresh();
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [user, refresh]);

  // Presence heartbeat: tell the server we're active so friends see us online.
  useEffect(() => {
    if (!user) return;
    const ping = () =>
      fetch("/api/presence", { method: "POST" }).catch(() => {});
    ping();
    const timer = setInterval(ping, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const markRead = useCallback((userId: string, ts?: number) => {
    const t = ts ?? Date.now();
    setReads((prev) => {
      if ((prev[userId] ?? 0) >= t) return prev;
      const next = { ...prev, [userId]: t };
      saveReads(next);
      return next;
    });
  }, []);

  const isUnread = useCallback(
    (userId: string) => {
      const c = conversations.find((c) => c.user.id === userId);
      if (!c || c.fromMe) return false;
      return new Date(c.lastAt).getTime() > (reads[userId] ?? 0);
    },
    [conversations, reads],
  );

  const unreadCount = conversations.filter(
    (c) => !c.fromMe && new Date(c.lastAt).getTime() > (reads[c.user.id] ?? 0),
  ).length;

  const requestPermission = useCallback(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <DmContext.Provider
      value={{
        conversations,
        unreadCount,
        isUnread,
        markRead,
        requestPermission,
        refresh,
      }}
    >
      {children}
    </DmContext.Provider>
  );
}

export function useDm(): DmState {
  const ctx = useContext(DmContext);
  if (!ctx) throw new Error("useDm must be used within DmProvider");
  return ctx;
}
