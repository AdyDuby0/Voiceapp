"use client";

import { RoomHeader } from "./RoomHeader";
import { ParticipantList } from "./ParticipantList";
import { ChatPanel } from "./ChatPanel";
import { ControlBar } from "./ControlBar";

// The room layout: header on top, a participants area beside a chat panel, and
// the control bar pinned to the bottom. Chat collapses below the participants
// on narrow screens.
export function RoomShell({ code }: { code: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <RoomHeader code={code} />

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-3xl">
            <ParticipantList code={code} />
          </div>
        </main>

        <aside className="h-72 border-t border-white/5 lg:h-auto lg:w-80 lg:border-l lg:border-t-0">
          <ChatPanel />
        </aside>
      </div>

      <ControlBar />
    </div>
  );
}
