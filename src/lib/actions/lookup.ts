"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";

export type CodeLookup =
  | { kind: "member"; id: string } // code belongs to an existing member
  | { kind: "free"; code: string } // pre-printed pool code, not yet assigned
  | { kind: "unknown" };

/**
 * Resolve a scanned/typed code within the active camp: an existing member,
 * a free pre-printed pool code, or unknown.
 */
export async function resolveCode(rawCode: string): Promise<CodeLookup> {
  await requireUser();
  const camp = await requireActiveCamp();
  const code = rawCode.trim().toUpperCase();
  if (!code) return { kind: "unknown" };

  const member = await prisma.member.findUnique({
    where: { campId_code: { campId: camp.id, code } },
    select: { id: true },
  });
  if (member) return { kind: "member", id: member.id };

  const pooled = await prisma.poolCode.findUnique({
    where: { campId_code: { campId: camp.id, code } },
    select: { code: true },
  });
  if (pooled) return { kind: "free", code: pooled.code };

  return { kind: "unknown" };
}
