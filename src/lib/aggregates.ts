import "server-only";
import { prisma } from "./db";

/** Recompute a squad's cached score totals from its current members. */
export async function recomputeSquadTotals(squadId: string) {
  const agg = await prisma.member.aggregate({
    where: { squadId },
    _sum: { physicalScore: true, mentalScore: true },
  });
  await prisma.squad.update({
    where: { id: squadId },
    data: {
      totalPhysical: agg._sum.physicalScore ?? 0,
      totalMental: agg._sum.mentalScore ?? 0,
    },
  });
}

/** Recompute totals for several squads (ignores nulls). */
export async function recomputeSquadTotalsMany(squadIds: (string | null | undefined)[]) {
  const unique = [...new Set(squadIds.filter((id): id is string => Boolean(id)))];
  await Promise.all(unique.map(recomputeSquadTotals));
}
