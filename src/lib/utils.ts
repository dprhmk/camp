import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date (or null) as a localized day, or a dash when missing. */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** True when the given birth date's month/day falls in the current week. */
export function isBirthdayThisWeek(
  dateOfBirth: Date | string | null | undefined,
  now = new Date(),
): boolean {
  if (!dateOfBirth) return false;
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (Number.isNaN(dob.getTime())) return false;

  // Start of the current week (Monday) .. +7 days.
  const start = new Date(now);
  const weekday = (start.getDay() + 6) % 7; // 0 = Monday
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekday);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (day.getMonth() === dob.getMonth() && day.getDate() === dob.getDate()) {
      return true;
    }
  }
  return false;
}

/** Full name in "Last First Middle" order, trimmed. May be empty. */
export function fullName(m: {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
}): string {
  return [m.lastName, m.firstName, m.middleName].filter(Boolean).join(" ");
}

/** Display name, falling back to the QR code when no name is set yet. */
export function displayName(m: {
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  code?: string;
}): string {
  const name = fullName(m);
  return name || (m.code ? `Учасник ${m.code}` : "Без імені");
}
