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
  "strength",
  "agilitySeconds",
  // Mental scale inputs
  "creativity",
  "communication",
];

/** Age in whole years from a birth date, or null. */
export function ageYears(
  dob: Date | string | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!dob) return null;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/**
 * Coarse age band from a birth date, for balancing age categories across
 * squads. Returns null when the date is missing/invalid.
 */
export function ageGroup(
  dob: Date | string | null | undefined,
  now: Date = new Date(),
): string | null {
  const age = ageYears(dob, now);
  if (age === null) return null;
  if (age <= 9) return "≤9";
  if (age <= 11) return "10-11";
  if (age <= 13) return "12-13";
  if (age <= 15) return "14-15";
  return "16+";
}

// Age bands in display order (for per-squad breakdowns).
export const AGE_BANDS = ["≤9", "10-11", "12-13", "14-15", "16+"] as const;

// Agility bands, relative to the cohort (terciles): fast / mid / slow.
export const AGILITY_BANDS = ["fast", "mid", "slow"] as const;
export type AgilityBand = (typeof AGILITY_BANDS)[number];

/**
 * Build a "which agility band" function from the whole cohort's run times.
 * Splitting at the 1/3 and 2/3 quantiles makes each band roughly a third of
 * the members, so the team balancer can spread fast and slow children evenly.
 */
export function makeAgilityBander(
  seconds: (number | null | undefined)[],
): (v: number | null | undefined) => AgilityBand | null {
  const sorted = seconds
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  const q = (p: number) =>
    sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : Infinity;
  const t1 = q(1 / 3);
  const t2 = q(2 / 3);
  return (v) => {
    if (typeof v !== "number") return null;
    if (v <= t1) return "fast";
    if (v <= t2) return "mid";
    return "slow";
  };
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
