"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useDm } from "./DmProvider";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import type { DirectMessage, UserSummary } from "@/lib/types";

const POLL_MS = 2000;

export function ConversationView({
  partner,
  onBack,
}: {
  partner: UserSummary;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const { markRead } = useDm();
  const me = user?.id;
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const lastAtRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Merge in new messages, deduped by id, keeping chronological order.
  const merge = useCallback((incoming: DirectMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      for (const m of incoming) {
        if (!seen.has(m.id)) merged.push(m);
      }
      const last = merged[merged.length - 1];
      if (last) lastAtRef.current = last.createdAt;
      return merged;
    });
  }, []);

  // Initial load + polling for new messages.
  useEffect(() => {
    let active = true;
    setMessages([]);
    lastAtRef.current = null;

    async function load(initial: boolean) {
      const since = lastAtRef.current;
      const url = `/api/dm/${partner.id}${since && !initial ? `?since=${encodeURIComponent(since)}` : ""}`;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = await res.json();
        merge(data.messages ?? []);
      } catch {
        // ignore transient errors; the next poll retries
      }
    }

    load(true);
    const timer = setInterval(() => load(false), POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [partner.id, merge]);

  // Keep the latest message in view, and mark the conversation read as messages
  // arrive while it's open.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    const last = messages[messages.length - 1];
    if (last) markRead(partner.id, new Date(last.createdAt).getTime());
  }, [messages, partner.id, markRead]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft("");
    try {
      const res = await fetch(`/api/dm/${partner.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (res.ok && data.message) merge([data.message]);
      else setDraft(text); // restore on failure
    } catch {
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-3">
        <button
          onClick={onBack}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>
        <Avatar name={partner.username} src={partner.avatarUrl} size={28} />
        <span className="text-sm font-semibold text-slate-100">
          {partner.username}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] animate-fade-in break-words rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-accent text-white"
                      : "bg-ink-600 text-slate-100"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-white/5 p-3"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${partner.username}…`}
          maxLength={2000}
        />
        <Button
          type="submit"
          size="md"
          className="shrink-0 px-3"
          disabled={!draft.trim() || sending}
          aria-label="Send"
        >
          <SendHorizonal size={16} />
        </Button>
      </form>
    </div>
  );
}
