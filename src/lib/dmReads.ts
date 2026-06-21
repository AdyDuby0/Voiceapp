// Per-conversation "last read" timestamps, kept in localStorage so unread state
// survives reloads. Keyed by the other user's id -> epoch ms of the last message
// you've seen from them.

const KEY = "voiceapp:dmReads";

export type Reads = Record<string, number>;

export function loadReads(): Reads {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveReads(reads: Reads): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(reads));
  } catch {
    // localStorage may be unavailable (private mode); non-fatal.
  }
}
