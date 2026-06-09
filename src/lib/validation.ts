import { z } from "zod";
import { BUILD_OPTIONS, GENDER_OPTIONS, PERSONALITY_OPTIONS, RESIDENCE_OPTIONS, ROLES } from "./enums";

// Empty form fields arrive as "" — treat them as "not provided".
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const requiredText = (message: string) => z.string().trim().min(1, message);

// A 1..3 scale that accepts "" / numbers / numeric strings.
const scale = z
  .union([z.literal(""), z.coerce.number().int().min(1, "Від 1 до 3").max(3, "Від 1 до 3")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : (v as number)));

const oneOf = (values: readonly string[]) =>
  z
    .union([z.literal(""), z.enum(values as [string, ...string[]])])
    .optional()
    .transform((v) => (v ? v : undefined));

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
  name: requiredText("Введіть назву загону"),
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
  leaderNames: z.array(z.string().trim()).optional(),
});

// --- Member (the big profile) ---------------------------------------------

export const memberSchema = z.object({
  // Basic
  lastName: requiredText("Введіть прізвище"),
  firstName: requiredText("Введіть імʼя"),
  middleName: optionalText,
  dateOfBirth: optionalText,
  gender: oneOf(GENDER_OPTIONS.map((o) => o.value)),
  residenceType: oneOf(RESIDENCE_OPTIONS.map((o) => o.value)),
  photoUrl: optionalText,

  // Contacts
  childPhone: optionalText,
  guardianName: optionalText,
  parentsPhone: optionalText,
  additionalContact: optionalText,
  instagram: optionalText,
  telegram: optionalText,
  otherSocial: optionalText,
  address: optionalText,

  // Physical
  height: z
    .union([z.literal(""), z.coerce.number().int().min(50, "Від 50 см").max(250, "До 250 см")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : (v as number))),
  build: oneOf(BUILD_OPTIONS.map((o) => o.value)),
  doesSports: boolish,
  sportType: optionalText,
  agility: scale,
  strength: scale,

  // Medical
  allergies: optionalText,
  medicalRestrictions: optionalText,
  physicalRestrictions: optionalText,
  medicalNotes: optionalText,

  // Psychological
  firstTimeAtCamp: boolish,
  isExceptional: boolish,
  panicAttacks: boolish,
  personalityType: oneOf(PERSONALITY_OPTIONS.map((o) => o.value)),

  // Creative
  drawing: scale,
  isMusician: boolish,
  instruments: optionalText,
  poetry: scale,

  // Intellect
  englishLevel: scale,
  generalLevel: scale,

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
