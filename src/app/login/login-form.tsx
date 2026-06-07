"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialActionState);

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          {state.message && <Alert variant="error">{state.message}</Alert>}

          <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              aria-invalid={!!state.fieldErrors?.email}
            />
          </Field>

          <Field label="Пароль" htmlFor="password" error={state.fieldErrors?.password}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!state.fieldErrors?.password}
            />
          </Field>

          <SubmitButton className="w-full">Увійти</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
