"use client";

import { useEffect, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";

// When push-to-talk is active, the mic stays muted until the user holds a key
// (default Space). Releasing it mutes again. Toggling the mode off restores an
// open mic. Returns whether the user is currently transmitting.
export function usePushToTalk(active: boolean, key = "Space"): boolean {
  const { localParticipant } = useLocalParticipant();
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Entering PTT mode: start muted.
    localParticipant.setMicrophoneEnabled(false);
    setTalking(false);

    const isTypingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      const tag = el?.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable;
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.code !== key || e.repeat || isTypingTarget(e.target)) return;
      e.preventDefault(); // stop Space from scrolling the page
      setTalking(true);
      localParticipant.setMicrophoneEnabled(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code !== key || isTypingTarget(e.target)) return;
      e.preventDefault();
      setTalking(false);
      localParticipant.setMicrophoneEnabled(false);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      // Leaving PTT mode: restore an open mic.
      localParticipant.setMicrophoneEnabled(true);
      setTalking(false);
    };
  }, [active, key, localParticipant]);

  return talking;
}
