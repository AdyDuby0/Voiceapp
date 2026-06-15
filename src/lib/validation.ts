// Account input rules, shared by the API and (loosely) mirrored in the UI.

// Letters and numbers only, 3–20 chars. Keeping it alphanumeric means a
// case-insensitive lookup is safe (no SQL wildcard characters like _ or %).
const USERNAME_RE = /^[a-zA-Z0-9]{3,20}$/;

export const PASSWORD_MIN = 8;

export function validateUsername(username: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return "Username must be 3–20 letters or numbers (no spaces or symbols).";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  return null;
}
