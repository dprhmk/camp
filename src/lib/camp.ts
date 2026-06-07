import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getActiveCampId } from "./session";

/** The active camp, or null if none is selected / it no longer exists. */
export async function getActiveCamp() {
  const id = await getActiveCampId();
  if (!id) return null;
  return prisma.camp.findUnique({ where: { id } });
}

/**
 * Require an active camp. Redirects to the camp selector when none is set.
 * Every camp-scoped page/action should start with this.
 */
export async function requireActiveCamp() {
  const camp = await getActiveCamp();
  if (!camp) redirect("/camps");
  return camp;
}
