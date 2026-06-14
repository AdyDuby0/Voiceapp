"use client";

import { useCallback, useState } from "react";
import { useDataChannel } from "@livekit/components-react";
import type { ChatMessage } from "@/lib/types";

const TOPIC = "chat";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Live, ephemeral room chat over LiveKit's data channel. Messages are kept in
// React state only — not persisted (matches Discord voice-channel behavior).
export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { send } = useDataChannel(TOPIC, (msg) => {
    try {
      const decoded = JSON.parse(decoder.decode(msg.payload)) as ChatMessage;
      setMessages((prev) => [...prev, decoded]);
    } catch {
      // Ignore malformed payloads.
    }
  });

  const sendMessage = useCallback(
    (text: string, senderName: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        senderName,
        text: trimmed,
        timestamp: Date.now(),
      };

      send(encoder.encode(JSON.stringify(message)), { reliable: true });
      // Data messages don't echo back to the sender, so append locally.
      setMessages((prev) => [...prev, message]);
    },
    [send],
  );

  return { messages, sendMessage };
}
