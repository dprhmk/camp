// Enum-like values stored as strings (SQLite has no native enums).
// Each list pairs a stored `value` with a Ukrainian UI `label`.

export type Option<T extends string = string> = { value: T; label: string };

export const ROLES = ["SUPER_ADMIN", "DIRECTOR", "LEADER"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_OPTIONS: Option<Role>[] = [
  { value: "SUPER_ADMIN", label: "Супер-адмін" },
  { value: "DIRECTOR", label: "Директор табору" },
  { value: "LEADER", label: "Вожатий" },
];

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Супер-адмін",
  DIRECTOR: "Директор табору",
  LEADER: "Вожатий",
};

export const GENDER_OPTIONS: Option[] = [
  { value: "MALE", label: "Хлопець" },
  { value: "FEMALE", label: "Дівчина" },
];

// NOTE: "тип проживання" values are an assumption — confirm with the customer.
export const RESIDENCE_OPTIONS: Option[] = [
  { value: "BUILDING", label: "У корпусі" },
  { value: "TENT", label: "У наметі" },
  { value: "HOME", label: "Удома (приходить)" },
];

export const BUILD_OPTIONS: Option[] = [
  { value: "SLIM", label: "Худорлява" },
  { value: "AVERAGE", label: "Середня" },
  { value: "ATHLETIC", label: "Спортивна" },
  { value: "HEAVY", label: "Щільна" },
];

export const PERSONALITY_OPTIONS: Option[] = [
  { value: "EXTROVERT", label: "Екстраверт" },
  { value: "INTROVERT", label: "Інтроверт" },
  { value: "AMBIVERT", label: "Амбіверт" },
];

// 1..5 scales used across the profile.
export const SCALE_OPTIONS: Option[] = [
  { value: "1", label: "1 — дуже низький" },
  { value: "2", label: "2 — низький" },
  { value: "3", label: "3 — середній" },
  { value: "4", label: "4 — високий" },
  { value: "5", label: "5 — дуже високий" },
];

/** Look up a label by value within an option list (falls back to the value). */
export function labelOf(options: Option[], value: string | null | undefined): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

// Labels for the two balanced score scales.
export const DIMENSION_LABELS: Record<string, string> = {
  physicalScore: "Фізична",
  mentalScore: "Розумова",
};

// Individual traits shown as radar axes (each 1..5), grouped by scale.
export const RADAR_TRAITS = [
  { key: "agility", label: "Спритність", group: "physical" },
  { key: "strength", label: "Сила", group: "physical" },
  { key: "endurance", label: "Витривалість", group: "physical" },
  { key: "coordination", label: "Координація", group: "physical" },
  { key: "intellect", label: "Інтелект", group: "mental" },
  { key: "logic", label: "Логіка", group: "mental" },
  { key: "creativity", label: "Творчість", group: "mental" },
  { key: "communication", label: "Комунікація", group: "mental" },
] as const;

export type TraitKey = (typeof RADAR_TRAITS)[number]["key"];

// Preset squad colors (mobile-friendly, high-contrast).
export const SQUAD_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#a855f7", // purple
  "#f97316", // orange
];
