// Enum-like values stored as strings (SQLite has no native enums).
// Each list pairs a stored `value` with a Ukrainian UI `label`.

export type Option<T extends string = string> = { value: T; label: string };

export const ROLES = ["SUPER_ADMIN", "USER"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_OPTIONS: Option<Role>[] = [
  { value: "USER", label: "Користувач" },
  { value: "SUPER_ADMIN", label: "Супер-адмін" },
];

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Супер-адмін",
  USER: "Користувач",
};

export const GENDER_OPTIONS: Option[] = [
  { value: "MALE", label: "Хлопець" },
  { value: "FEMALE", label: "Дівчина" },
];

// Тип проживання — only two options.
export const RESIDENCE_OPTIONS: Option[] = [
  { value: "BUILDING", label: "У корпусі" },
  { value: "HOME", label: "Удома (приходить)" },
];
export const RESIDENCE_DEFAULT = "BUILDING";

// Зріст — a coarse level (was a numeric cm field).
export const HEIGHT_OPTIONS: Option[] = [
  { value: "LOW", label: "Низький" },
  { value: "MEDIUM", label: "Середній" },
  { value: "HIGH", label: "Високий" },
];
export const HEIGHT_DEFAULT = "MEDIUM";

// Статура — three options.
export const BUILD_OPTIONS: Option[] = [
  { value: "SLIM", label: "Худорлява" },
  { value: "AVERAGE", label: "Середня" },
  { value: "HEAVY", label: "Повна" },
];
export const BUILD_DEFAULT = "AVERAGE";

// Сила — three levels.
export const STRENGTH_OPTIONS: Option[] = [
  { value: "WEAK", label: "Слабкий" },
  { value: "NORMAL", label: "Нормальний" },
  { value: "STRONG", label: "Сильний" },
];
export const STRENGTH_DEFAULT = "NORMAL";

// 1..3 scales used by the scored profile traits (creativity, communication).
export const SCALE_OPTIONS: Option[] = [
  { value: "1", label: "1 — низький" },
  { value: "2", label: "2 — середній" },
  { value: "3", label: "3 — високий" },
];
export const SCALE_DEFAULT = "2"; // середній

/** Look up a label by value within an option list (falls back to the value). */
export function labelOf(options: Option[], value: string | null | undefined): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

// Preset squad colors (mobile-friendly, high-contrast).
export const SQUAD_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#a855f7", // purple
  "#f97316", // orange
];
