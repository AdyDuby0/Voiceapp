"use client";

import { RoomHeader } from "./RoomHeader";
import { ParticipantList } from "./ParticipantList";
import { ChatPanel } from "./ChatPanel";
import { ControlBar } from "./ControlBar";
import { ScreenShareView } from "./ScreenShareView";
import { useRoomInfo } from "@/hooks/useRoomInfo";
import { useAuth } from "./auth/AuthProvider";

// The room layout: header on top, a participants area beside a chat panel, and
// the control bar pinned to the bottom. Chat collapses below the participants
// on narrow screens.
export function RoomShell({ code }: { code: string }) {
  const { info, refresh } = useRoomInfo(code);
  const { user } = useAuth();
  const isOwner = !!user && !!info && info.ownerId === user.id;

  return (
    <div className="flex h-[100dvh] flex-col">
      <RoomHeader
        code={code}
        isOwner={isOwner}
        maxParticipants={info?.maxParticipants ?? null}
        onCapacityChange={refresh}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="mx-auto max-w-3xl">
            <ScreenShareView />
            <ParticipantList code={code} isOwner={isOwner} />
          </div>
        </main>

        <aside className="h-52 shrink-0 border-t border-white/10 lg:h-auto lg:w-80 lg:shrink lg:border-l lg:border-t-0">
          <ChatPanel />
        </aside>
      </div>

      <ControlBar />
    </div>
  );
}
