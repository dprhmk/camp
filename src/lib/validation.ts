import { z } from "zod";
import { BUILD_OPTIONS, GENDER_OPTIONS, HEIGHT_OPTIONS, RESIDENCE_OPTIONS, ROLES } from "./enums";

// Empty form fields arrive as "" — treat them as "not provided".
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const requiredText = (message: string) => z.string().trim().min(1, message);

// A 1..5 scale that accepts "" / numbers / numeric strings.
const scale = z
  .union([z.literal(""), z.coerce.number().int().min(1, "Від 1 до 5").max(5, "Від 1 до 5")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : (v as number)));

// A required select: empty -> message; must be one of the allowed values.
const requiredOneOf = (values: readonly string[], message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((v) => values.includes(v), message);

const boolish = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false"), z.undefined()])
  .optional()
  .transform((v) => v === true || v === "on" || v === "true");

// --- Auth ------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Введіть email").pipe(z.email("Некоректний email")),
  password: z.string().min(1, "Введіть пароль"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  name: requiredText("Введіть імʼя"),
  email: z.string().trim().min(1, "Введіть email").pipe(z.email("Некоректний email")),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
  password: z
    .string()
    .min(6, "Пароль щонайменше 6 символів")
    .optional()
    .or(z.literal("")),
});
export type UserInput = z.infer<typeof userSchema>;

// --- Camp ------------------------------------------------------------------

export const campSchema = z.object({
  name: requiredText("Введіть назву табору"),
  year: z.coerce
    .number({ message: "Вкажіть рік" })
    .int("Рік має бути цілим")
    .min(2000, "Рік від 2000")
    .max(2100, "Рік до 2100"),
  startDate: optionalText,
  endDate: optionalText,
  description: optionalText,
});
export type CampInput = z.infer<typeof campSchema>;

// --- Squad -----------------------------------------------------------------

export const squadSchema = z.object({
  // Optional — a blank name falls back to "Загін N" (filled in the action).
  name: optionalText,
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Колір у форматі #RRGGBB"),
  leaderUserId: optionalText,
  leaderName: optionalText,
  assistantName: optionalText,
});
export type SquadInput = z.infer<typeof squadSchema>;

// --- Schedule --------------------------------------------------------------

const time = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Час у форматі ГГ:ХХ");

export const scheduleSchema = z.object({
  date: requiredText("Оберіть день"),
  startTime: time,
  endTime: z
    .union([z.literal(""), time])
    .optional()
    .transform((v) => (v ? v : undefined)),
  title: requiredText("Введіть назву події"),
  description: optionalText,
});
export type ScheduleInput = z.infer<typeof scheduleSchema>;

// --- Generate teams --------------------------------------------------------

export const generateSchema = z.object({
  numSquads: z.coerce.number().int().min(2, "Мінімум 2 загони").max(6, "Максимум 6 загонів"),
  // One selected leader account id per squad (in squad order); "" means none.
  leaderUserIds: z.array(z.string().trim()).optional(),
});

// --- Member (the big profile) ---------------------------------------------

export const memberSchema = z.object({
  // Basic — name + identity required; middle name optional.
  lastName: requiredText("Введіть прізвище"),
  firstName: requiredText("Введіть імʼя"),
  middleName: optionalText,
  dateOfBirth: requiredText("Оберіть дату народження"),
  gender: requiredOneOf(GENDER_OPTIONS.map((o) => o.value), "Оберіть стать"),
  residenceType: requiredOneOf(RESIDENCE_OPTIONS.map((o) => o.value), "Оберіть тип проживання"),
  photoUrl: optionalText,

  // Contacts — all optional.
  childPhone: optionalText,
  guardianName: optionalText,
  parentsPhone: optionalText,
  additionalContact: optionalText,
  instagram: optionalText,
  telegram: optionalText,
  otherSocial: optionalText,
  address: optionalText,

  // Physical — required: height level + build; plus the "does sports" flag.
  height: requiredOneOf(HEIGHT_OPTIONS.map((o) => o.value), "Оберіть зріст"),
  build: requiredOneOf(BUILD_OPTIONS.map((o) => o.value), "Оберіть статуру"),
  doesSports: boolish,

  // Mental ("розумова / креативна") — two scored traits (1..5).
  creativity: scale,
  communication: scale,

  // Medical & notes (profile info, not scored).
  allergies: optionalText,
  medicalRestrictions: optionalText,
  physicalRestrictions: optionalText,
  medicalNotes: optionalText,
  isExceptional: boolish, // "Особливий"

  // System
  squadId: optionalText,
  isLeader: boolish,
});
export type MemberInput = z.infer<typeof memberSchema>;

/** Flatten a ZodError into a { field: message } map for the UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
