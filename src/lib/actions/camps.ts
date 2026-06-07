"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, requirePermission } from "@/lib/auth";
import {
  clearActiveCamp,
  getActiveCampId,
  setActiveCampId,
} from "@/lib/session";
import { campSchema, fieldErrors } from "@/lib/validation";
import type { ActionState } from "./types";

function parseDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCampAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("camp:create");

  const parsed = campSchema.safeParse({
    name: formData.get("name"),
    year: formData.get("year"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const camp = await prisma.camp.create({
    data: {
      name: parsed.data.name,
      year: parsed.data.year,
      startDate: parseDate(parsed.data.startDate),
      endDate: parseDate(parsed.data.endDate),
      description: parsed.data.description ?? null,
    },
  });

  await setActiveCampId(camp.id);
  redirect("/members");
}

export async function switchCampAction(campId: string) {
  await requireUser();
  const camp = await prisma.camp.findUnique({ where: { id: campId } });
  if (!camp) return;
  await setActiveCampId(campId);
  redirect("/members");
}

export async function deleteCampAction(campId: string) {
  await requirePermission("camp:delete");
  await prisma.camp.delete({ where: { id: campId } });

  if ((await getActiveCampId()) === campId) {
    await clearActiveCamp();
  }
  revalidatePath("/camps");
}
