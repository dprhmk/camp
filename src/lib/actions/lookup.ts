"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireActiveCamp } from "@/lib/camp";

/**
 * Resolve a member by their code within the active camp.
 * Returns the member id, or null if not found.
 */
export async function findMemberByCode(rawCode: string): Promise<{ id: string } | null> {
  await requireUser();
  const camp = await requireActiveCamp();
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const member = await prisma.member.findUnique({
    where: { campId_code: { campId: camp.id, code } },
    select: { id: true },
  });
  return member;
}
