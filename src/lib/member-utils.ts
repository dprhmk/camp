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

/**
 * Coarse age band from a birth date, for balancing age categories across
 * squads. Returns null when the date is missing/invalid.
 */
export function ageGroup(
  dob: Date | string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!dob) return null;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  if (age <= 9) return "≤9";
  if (age <= 11) return "10-11";
  if (age <= 13) return "12-13";
  if (age <= 15) return "14-15";
  return "16+";
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
