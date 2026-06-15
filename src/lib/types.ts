// A chat message sent over the LiveKit data channel. Ephemeral for the MVP —
// kept in React state on each client, not persisted anywhere.
export type ChatMessage = {
  id: string;
  senderName: string;
  text: string;
  timestamp: number; // epoch ms
};

// Display name + room are passed from the join form into the room screen.
export type JoinIntent = {
  name: string;
  code: string;
};

// A signed-in account as exposed to the browser (never includes the password).
export type AccountUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
};
