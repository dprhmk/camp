"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";
import { distributeBalanced } from "@/lib/scoring";
import { ageGroup } from "@/lib/member-utils";
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
    leaderUserIds: formData.getAll("leaderUserIds").map(String),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const { numSquads, leaderUserIds = [] } = parsed.data;

  const members = await prisma.member.findMany({
    where: { campId: camp.id },
    select: {
      id: true,
      physicalScore: true,
      mentalScore: true,
      gender: true,
      residenceType: true,
      height: true,
      build: true,
      dateOfBirth: true,
    },
  });

  if (members.length === 0) {
    return { ok: false, message: "У таборі ще немає учасників для розподілу" };
  }

  // Block until every member is ready — otherwise the balance would be unfair.
  const notReady = await prisma.member.count({
    where: { campId: camp.id, isProfileComplete: false },
  });
  if (notReady > 0) {
    return {
      ok: false,
      message: `${notReady} ${notReady === 1 ? "учасник має" : "учасників мають"} незаповнену анкету. Заповніть характеристики всіх учасників перед розподілом.`,
    };
  }

  // Resolve selected leader accounts -> { id, name } so we can set both the
  // account binding and the display name on each new squad.
  const chosenIds = [...new Set(leaderUserIds.filter(Boolean))];
  const leaderUsers = chosenIds.length
    ? await prisma.user.findMany({
        where: { id: { in: chosenIds } },
        select: { id: true, name: true },
      })
    : [];
  const leaderById = new Map(leaderUsers.map((u) => [u.id, u.name]));

  // Balance across every categorical axis at once: gender, residence, height,
  // build and age band (date of birth) — plus the physical/mental scores.
  const now = new Date();
  const result = distributeBalanced(
    members.map((m) => ({
      id: m.id,
      physicalScore: m.physicalScore,
      mentalScore: m.mentalScore,
      groups: [
        m.gender && `g:${m.gender}`,
        m.residenceType && `r:${m.residenceType}`,
        m.height && `h:${m.height}`,
        m.build && `b:${m.build}`,
        ageGroup(m.dateOfBirth, now) && `age:${ageGroup(m.dateOfBirth, now)}`,
      ].filter((g): g is string => Boolean(g)),
    })),
    numSquads,
    // Fresh shuffle each press; keep the best-balanced of many fast attempts.
    { rng: Math.random, attempts: 60 },
  );

  await prisma.$transaction(async (tx) => {
    // Replace existing squads (members are detached by onDelete: SetNull).
    await tx.squad.deleteMany({ where: { campId: camp.id } });

    for (const squad of result.squads) {
      const leaderUserId = leaderUserIds[squad.index] || null;
      const leaderName = leaderUserId ? (leaderById.get(leaderUserId) ?? null) : null;
      const created = await tx.squad.create({
        data: {
          campId: camp.id,
          name: `Загін ${squad.index + 1}`,
          color: SQUAD_COLORS[squad.index % SQUAD_COLORS.length],
          // Bind the chosen leader account and copy its name for display.
          leaderUserId: leaderById.has(leaderUserId ?? "") ? leaderUserId : null,
          leaderName,
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
