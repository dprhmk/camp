import "server-only";
import { prisma } from "./db";
import { displayName } from "./utils";

export type SquadLeaders = Record<string, { memberId: string; name: string }>;

/** Map of squadId -> the squad's current leader child (for the one-leader rule). */
export async function getSquadLeaders(campId: string): Promise<SquadLeaders> {
  const rows = await prisma.member.findMany({
    where: { campId, isLeader: true, squadId: { not: null } },
    select: { id: true, squadId: true, lastName: true, firstName: true, middleName: true },
  });
  const map: SquadLeaders = {};
  for (const r of rows) {
    if (r.squadId) map[r.squadId] = { memberId: r.id, name: displayName(r) };
  }
  return map;
}
