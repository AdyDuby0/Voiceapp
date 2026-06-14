"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { SendHorizonal, MessagesSquare } from "lucide-react";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatMessage } from "./ChatMessage";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export function ChatPanel() {
  const { messages, sendMessage } = useChatMessages();
  const { localParticipant } = useLocalParticipant();
  const senderName = localParticipant.name || localParticipant.identity;
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(draft, senderName);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 text-sm font-medium text-slate-300">
        <MessagesSquare size={16} className="text-accent-glow" />
        Chat
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              isOwn={m.senderName === senderName}
            />
          ))
        )}
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-white/5 p-3"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the room…"
          maxLength={500}
        />
        <Button
          type="submit"
          size="md"
          className="shrink-0 px-3"
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <SendHorizonal size={16} />
        </Button>
      </form>
    </div>
  );
}
