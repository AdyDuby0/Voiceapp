// Human-friendly room codes. Avoids ambiguous characters (0/O, 1/I/L) so codes
// are easy to read aloud and share. The code in the URL *is* the room — LiveKit
// auto-creates the room on first join, so there's no server-side room registry.

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function generateRoomCode(length = CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

// Normalize user input into a canonical code: uppercase, stripped of anything
// that isn't an allowed character. Used for both the join form and URL segments.
export function normalizeRoomCode(input: string): string {
  return input
    .toUpperCase()
    .split("")
    .filter((c) => ALPHABET.includes(c))
    .join("");
}

export function isValidRoomCode(input: string): boolean {
  const normalized = normalizeRoomCode(input);
  return normalized.length >= 4 && normalized.length <= 12;
}
