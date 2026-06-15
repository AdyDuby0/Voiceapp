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

// A user as shown in search results / conversation headers.
export type UserSummary = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

// A single direct message between two users.
export type DirectMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string; // ISO timestamp
};

// One row in the DM inbox: who you're talking to + a preview of the last message.
export type ConversationSummary = {
  user: UserSummary;
  lastMessage: string;
  lastAt: string;
  fromMe: boolean;
};

// Friendship state of another user, from your perspective.
export type FriendStatus = "friend" | "incoming" | "outgoing" | "none";

export type IncomingRequest = { requestId: string; user: UserSummary };

export type FriendsData = {
  friends: UserSummary[];
  incoming: IncomingRequest[];
  outgoing: string[]; // user ids you've requested
};
