"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { fieldErrors, userSchema } from "@/lib/validation";
import type { ActionState } from "./types";

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("user:manage");

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  if (!parsed.data.password) {
    return { ok: false, fieldErrors: { password: "Введіть пароль для нового акаунта" } };
  }

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, fieldErrors: { email: "Акаунт з таким email вже існує" } };
    }
    throw e;
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function updateUserAction(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("user:manage");

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        // Only set a new password when one was provided.
        ...(parsed.data.password
          ? { passwordHash: await hashPassword(parsed.data.password) }
          : {}),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, fieldErrors: { email: "Акаунт з таким email вже існує" } };
    }
    throw e;
  }

  revalidatePath("/users");
  return { ok: true };
}

export async function deleteUserAction(userId: string) {
  await requirePermission("user:manage");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/users");
}
