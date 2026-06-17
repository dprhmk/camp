"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, canManageSquad } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { fieldErrors, squadSchema } from "@/lib/validation";
import type { ActionState } from "./types";

/** A blank squad name falls back to "Загін N" by its position in the camp. */
async function defaultSquadName(campId: string, squadId?: string): Promise<string> {
  const squads = await prisma.squad.findMany({
    where: { campId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const idx = squadId ? squads.findIndex((s) => s.id === squadId) : -1;
  return `Загін ${(idx === -1 ? squads.length : idx) + 1}`;
}

export async function createSquadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  // Creating a squad is a camp-wide action (director/admin).
  if (!can(user, "squad:manageAny")) {
    return { ok: false, message: "Недостатньо прав для створення загону" };
  }

  const parsed = squadSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    leaderUserId: formData.get("leaderUserId"),
    leaderName: formData.get("leaderName"),
    assistantName: formData.get("assistantName"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await prisma.squad.create({
    data: {
      campId: camp.id,
      name: parsed.data.name ?? (await defaultSquadName(camp.id)),
      color: parsed.data.color,
      leaderUserId: parsed.data.leaderUserId ?? null,
      leaderName: parsed.data.leaderName ?? null,
      assistantName: parsed.data.assistantName ?? null,
    },
  });

  revalidatePath("/squads");
  return { ok: true };
}

export async function updateSquadAction(
  squadId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const camp = await requireActiveCamp();

  const squad = await prisma.squad.findFirst({ where: { id: squadId, campId: camp.id } });
  if (!squad) return { ok: false, message: "Загін не знайдено" };
  if (!canManageSquad(user, squad)) {
    return { ok: false, message: "Ви можете керувати лише своїм загоном" };
  }

  const parsed = squadSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    leaderUserId: formData.get("leaderUserId"),
    leaderName: formData.get("leaderName"),
    assistantName: formData.get("assistantName"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  // Only director/admin may change which account leads the squad.
  const canChangeLeader = can(user, "squad:changeLeader");

  await prisma.squad.update({
    where: { id: squadId },
    data: {
      name: parsed.data.name ?? (await defaultSquadName(camp.id, squadId)),
      color: parsed.data.color,
      leaderName: parsed.data.leaderName ?? null,
      assistantName: parsed.data.assistantName ?? null,
      ...(canChangeLeader ? { leaderUserId: parsed.data.leaderUserId ?? null } : {}),
    },
  });

  revalidatePath("/squads");
  return { ok: true };
}

export async function deleteSquadAction(squadId: string) {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  const squad = await prisma.squad.findFirst({ where: { id: squadId, campId: camp.id } });
  if (!squad) return;
  if (!can(user, "squad:manageAny")) return;

  // Members are detached (squadId -> null) by the DB onDelete: SetNull.
  await prisma.squad.delete({ where: { id: squadId } });
  revalidatePath("/squads");
  revalidatePath("/members");
}
