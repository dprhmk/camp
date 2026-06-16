import type { MemberInput } from "./validation";

/**
 * A profile counts as "complete" when the identity fields and all
 * score-relevant fields are filled in. This drives the red "incomplete"
 * highlight in the members list.
 */
export function isProfileComplete(m: Partial<MemberInput>): boolean {
  const filled = (v: unknown) =>
    v !== undefined && v !== null && v !== "" && !(typeof v === "number" && Number.isNaN(v));

  return DISTRIBUTION_FIELDS.every((key) => filled(m[key]));
}

/**
 * Fields required for fair team distribution (the inputs to the four score
 * dimensions). A member is "ready" only when all of these are filled — the
 * "Generate teams" screen blocks until every member is ready.
 */
export const DISTRIBUTION_FIELDS: (keyof MemberInput)[] = [
  // Physical
  "agility",
  "strength",
  "endurance",
  "coordination",
  "height",
  "weight",
  "build",
  // Mental ("розумова")
  "intellect",
  "logic",
  "creativity",
  "communication",
];

/** Which distribution fields are still missing on a member. */
export function missingDistributionFields(m: Partial<MemberInput>): (keyof MemberInput)[] {
  const filled = (v: unknown) =>
    v !== undefined && v !== null && v !== "" && !(typeof v === "number" && Number.isNaN(v));
  return DISTRIBUTION_FIELDS.filter((key) => !filled(m[key]));
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
