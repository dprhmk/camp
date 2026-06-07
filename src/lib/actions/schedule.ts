"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { fieldErrors, scheduleSchema } from "@/lib/validation";
import type { ActionState } from "./types";

function parseDay(value: string) {
  const d = new Date(value);
  d.setHours(12, 0, 0, 0); // noon avoids timezone day-shift
  return d;
}

export async function createScheduleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("schedule:edit");
  const camp = await requireActiveCamp();

  const parsed = scheduleSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await prisma.scheduleEntry.create({
    data: {
      campId: camp.id,
      date: parseDay(parsed.data.date),
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/schedule");
  return { ok: true };
}

export async function updateScheduleAction(
  entryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("schedule:edit");
  await requireActiveCamp();

  const parsed = scheduleSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await prisma.scheduleEntry.update({
    where: { id: entryId },
    data: {
      date: parseDay(parsed.data.date),
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath("/schedule");
  return { ok: true };
}

export async function deleteScheduleAction(entryId: string) {
  await requirePermission("schedule:edit");
  await prisma.scheduleEntry.delete({ where: { id: entryId } });
  revalidatePath("/schedule");
}
