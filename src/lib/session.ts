import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import type { Role } from "./enums";
import { SESSION_COOKIE, ACTIVE_CAMP_COOKIE } from "./constants";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/** Create a signed session cookie for the given user. */
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Remove the session and active-camp cookies. */
export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(ACTIVE_CAMP_COOKIE);
}

/** Resolve the currently logged-in user, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = payload.sub;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return null;
    return { ...user, role: user.role as Role };
  } catch {
    return null;
  }
}

// --- Active camp -----------------------------------------------------------

export async function getActiveCampId(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACTIVE_CAMP_COOKIE)?.value ?? null;
}

export async function setActiveCampId(campId: string) {
  const store = await cookies();
  store.set(ACTIVE_CAMP_COOKIE, campId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearActiveCamp() {
  const store = await cookies();
  store.delete(ACTIVE_CAMP_COOKIE);
}

export { SESSION_COOKIE, ACTIVE_CAMP_COOKIE };
