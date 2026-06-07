"use client";

import * as React from "react";
import { useActionState } from "react";
import { Shuffle } from "lucide-react";
import { generateTeamsAction } from "@/lib/actions/generate";
import { initialActionState } from "@/lib/actions/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";

export function GenerateForm({ memberCount }: { memberCount: number }) {
  const [count, setCount] = React.useState(3);
  const [state, formAction] = useActionState(generateTeamsAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && <Alert variant="error">{state.message}</Alert>}

      <Alert variant="info">
        Буде розподілено <b>{memberCount}</b> учасників. Поточні загони будуть{" "}
        <b>замінені</b> новими. Виконуйте на старті сезону.
      </Alert>

      <Card>
        <CardContent className="space-y-4">
          <Field label="Кількість загонів" htmlFor="numSquads" required error={state.fieldErrors?.numSquads}>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className={`size-12 rounded-xl border text-lg font-semibold ${
                    count === n
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input type="hidden" name="numSquads" value={count} />
          </Field>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Імена вожатих (необовʼязково)</p>
            {Array.from({ length: count }, (_, i) => (
              <Input
                key={i}
                name="leaderNames"
                placeholder={`Вожатий загону ${i + 1}`}
                aria-label={`Вожатий загону ${i + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <SubmitButton className="w-full" size="lg">
        <Shuffle className="size-5" />
        Згенерувати команди
      </SubmitButton>
    </form>
  );
}
