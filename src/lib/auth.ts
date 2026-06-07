import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentUser, type SessionUser } from "./session";
import { can, type Action } from "./rbac";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Verify credentials and return the user, or null on failure. */
export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

/** Server guard: require a logged-in user, else redirect to /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Server guard: require a specific permission, else 403 page. */
export async function requirePermission(action: Action): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user, action)) redirect("/forbidden");
  return user;
}
