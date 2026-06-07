"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { distributeMembers } from "@/lib/scoring";
import { SQUAD_COLORS } from "@/lib/enums";
import { generateSchema, fieldErrors } from "@/lib/validation";
import type { ActionState } from "./types";

/**
 * Generate balanced teams for the active camp. Replaces existing squads with
 * `numSquads` fresh squads and assigns every member so that headcounts and
 * total physical/mental scores are evenly balanced. Run once at season start.
 */
export async function generateTeamsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("generate:run");
  const camp = await requireActiveCamp();

  const parsed = generateSchema.safeParse({
    numSquads: formData.get("numSquads"),
    leaderNames: formData.getAll("leaderNames").map(String),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const { numSquads, leaderNames = [] } = parsed.data;

  const members = await prisma.member.findMany({
    where: { campId: camp.id },
    select: { id: true, physicalScore: true, mentalScore: true },
  });

  if (members.length === 0) {
    return { ok: false, message: "У таборі ще немає учасників для розподілу" };
  }

  const result = distributeMembers(members, numSquads);

  await prisma.$transaction(async (tx) => {
    // Replace existing squads (members are detached by onDelete: SetNull).
    await tx.squad.deleteMany({ where: { campId: camp.id } });

    for (const squad of result.squads) {
      const created = await tx.squad.create({
        data: {
          campId: camp.id,
          name: `Загін ${squad.index + 1}`,
          color: SQUAD_COLORS[squad.index % SQUAD_COLORS.length],
          leaderName: leaderNames[squad.index]?.trim() || null,
          totalPhysical: squad.totalPhysical,
          totalMental: squad.totalMental,
        },
      });
      if (squad.memberIds.length > 0) {
        await tx.member.updateMany({
          where: { id: { in: squad.memberIds } },
          data: { squadId: created.id },
        });
      }
    }
  });

  redirect("/squads");
}
