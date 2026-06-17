import type { MemberInput } from "./validation";

/**
 * A profile counts as "complete" when the identity fields and all
 * score-relevant fields are filled in. This drives the red "incomplete"
 * highlight in the members list.
 */
export function isProfileComplete(m: Partial<MemberInput>): boolean {
  const filled = (v: unknown) =>
    v !== undefined && v !== null && v !== "" && !(typeof v === "number" && Number.isNaN(v));

  return COMPLETE_FIELDS.every((key) => filled(m[key]));
}

/**
 * Fields that make a profile "ready for distribution": identity + the inputs to
 * both score scales. The "Generate teams" screen blocks until every member is
 * ready, and the members list shows incomplete ones in red.
 */
export const COMPLETE_FIELDS: (keyof MemberInput)[] = [
  "lastName",
  "firstName",
  "dateOfBirth",
  "gender",
  "residenceType",
  // Physical scale inputs
  "height",
  "build",
  // Mental scale inputs
  "creativity",
  "communication",
];

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

/** Generate a short human-friendly code (e.g. for QR). */
export function generateCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
