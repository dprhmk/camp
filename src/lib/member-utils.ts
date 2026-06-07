import type { MemberInput } from "./validation";

/**
 * A profile counts as "complete" when the identity fields and all
 * score-relevant fields are filled in. This drives the red "incomplete"
 * highlight in the members list.
 */
export function isProfileComplete(m: Partial<MemberInput>): boolean {
  const filled = (v: unknown) =>
    v !== undefined && v !== null && v !== "" && !(typeof v === "number" && Number.isNaN(v));

  const required: (keyof MemberInput)[] = [
    "lastName",
    "firstName",
    "dateOfBirth",
    "gender",
    "agility",
    "strength",
    "drawing",
    "poetry",
    "englishLevel",
    "generalLevel",
    "personalityType",
  ];
  return required.every((key) => filled(m[key]));
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

/** Generate a short human-friendly code (e.g. for QR). */
export function generateCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
