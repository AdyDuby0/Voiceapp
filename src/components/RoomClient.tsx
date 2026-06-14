"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRoomConnection } from "@/hooks/useRoomConnection";
import { readDisplayName, rememberDisplayName } from "@/lib/displayName";
import { NamePrompt } from "./NamePrompt";
import { RoomHeader } from "./RoomHeader";
import { ParticipantList } from "./ParticipantList";
import { ControlBar } from "./ControlBar";
import { Button } from "./ui/Button";

export function RoomClient({ code }: { code: string }) {
  const router = useRouter();
  // Lazy init from sessionStorage; null means we need to prompt for a name.
  const [name, setName] = useState<string | null>(() => readDisplayName());
  const conn = useRoomConnection(code, name);

  if (!name) {
    return (
      <NamePrompt
        code={code}
        onSubmit={(n) => {
          rememberDisplayName(n);
          setName(n);
        }}
      />
    );
  }

  if (conn.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-sm text-slate-400">
          Connecting to room…
        </p>
      </main>
    );
  }

  if (conn.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <h1 className="text-lg font-semibold text-white">
            Couldn&apos;t join
          </h1>
          <p className="mt-1 text-sm text-slate-400">{conn.message}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.push("/")}
          >
            Back to start
          </Button>
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={conn.url}
      token={conn.token}
      connect
      audio // publish the microphone on join
      video={false}
      className="flex min-h-screen flex-col"
      onDisconnected={() => router.push("/")}
    >
      {/* Plays everyone else's audio. */}
      <RoomAudioRenderer />
      <RoomHeader code={code} />
      <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-6">
        <ParticipantList />
      </div>
      <ControlBar />
    </LiveKitRoom>
  );
}
