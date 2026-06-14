"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/types";
import { Avatar } from "./ui/Avatar";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessage({
  message,
  isOwn,
}: {
  message: ChatMessageType;
  isOwn: boolean;
}) {
  return (
    <div className="flex animate-fade-in gap-2.5">
      <Avatar name={message.senderName} size={32} className="mt-0.5" />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-slate-200">
            {message.senderName}
            {isOwn && <span className="text-slate-500"> (you)</span>}
          </span>
          <span className="text-[11px] text-slate-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <p className="break-words text-sm text-slate-300">{message.text}</p>
      </div>
    </div>
  );
}
