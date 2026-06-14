// The display name is chosen on the landing page and read again on the room
// screen. We keep it in sessionStorage (per-tab) rather than the URL so it stays
// out of shareable links. Someone who opens a room link directly won't have one
// yet — the room screen handles that by prompting.

const KEY = "voiceapp:displayName";

export function rememberDisplayName(name: string): void {
  try {
    sessionStorage.setItem(KEY, name);
  } catch {
    // sessionStorage can be unavailable (e.g. privacy mode); non-fatal.
  }
}

export function readDisplayName(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
