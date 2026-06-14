"use client";

import { useEffect, useState } from "react";

type ConnectionState =
  | { status: "loading" }
  | { status: "ready"; token: string; url: string }
  | { status: "error"; message: string };

// Fetches a LiveKit join token from our /api/token route for the given room +
// display name. Returns the token and websocket URL that <LiveKitRoom> needs.
export function useRoomConnection(
  room: string,
  name: string | null,
): ConnectionState {
  const [state, setState] = useState<ConnectionState>({ status: "loading" });

  useEffect(() => {
    if (!name) return; // waiting for the user to provide a name
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      try {
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room, name }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState({
            status: "error",
            message: data.error ?? "Could not join the room.",
          });
          return;
        }
        if (!data.url) {
          setState({
            status: "error",
            message:
              "LiveKit server URL is not configured. Set NEXT_PUBLIC_LIVEKIT_URL in .env.local.",
          });
          return;
        }
        setState({ status: "ready", token: data.token, url: data.url });
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Network error while joining the room.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [room, name]);

  return state;
}
