"use server";

import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { fieldErrors, loginSchema } from "@/lib/validation";
import type { ActionState } from "./types";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, message: "Невірний email або пароль" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
