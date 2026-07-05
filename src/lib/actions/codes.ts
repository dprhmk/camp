"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { requireActiveCamp } from "@/lib/camp";
import { generateCode } from "@/lib/member-utils";
import type { ActionState } from "./types";

const MAX_POOL = 500;

/**
 * Generate `count` new pool codes for the active camp, unique against both
 * the existing pool and member codes.
 */
export async function generatePoolCodesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const camp = await requireActiveCamp();
  if (!can(user, "codes:manage")) {
    return { ok: false, message: "Недостатньо прав для генерації кодів" };
  }

  const count = Number(formData.get("count"));
  if (!Number.isInteger(count) || count < 1 || count > MAX_POOL) {
    return { ok: false, message: `Кількість має бути від 1 до ${MAX_POOL}` };
  }

  const [pool, members] = await Promise.all([
    prisma.poolCode.findMany({ where: { campId: camp.id }, select: { code: true } }),
    prisma.member.findMany({ where: { campId: camp.id }, select: { code: true } }),
  ]);
  if (pool.length + count > MAX_POOL) {
    return { ok: false, message: `У пулі вже ${pool.length} кодів — разом не більше ${MAX_POOL}` };
  }

  const used = new Set([...pool, ...members].map((r) => r.code));
  const fresh: string[] = [];
  while (fresh.length < count) {
    const code = generateCode();
    if (!used.has(code)) {
      used.add(code);
      fresh.push(code);
    }
  }

  await prisma.poolCode.createMany({
    data: fresh.map((code) => ({ campId: camp.id, code })),
  });

  revalidatePath("/qr-codes");
  return { ok: true, message: `Згенеровано ${count} нових кодів` };
}
