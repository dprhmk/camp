"use client";

import * as React from "react";
import { useActionState } from "react";
import { Shuffle } from "lucide-react";
import { generateTeamsAction } from "@/lib/actions/generate";
import { initialActionState } from "@/lib/actions/types";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";
import { useToast } from "@/components/ui/toast";

export function GenerateForm({
  memberCount,
  notReadyCount,
}: {
  memberCount: number;
  notReadyCount: number;
}) {
  const [count, setCount] = React.useState(4);
  const [state, formAction] = useActionState(generateTeamsAction, initialActionState);
  const toast = useToast();

  React.useEffect(() => {
    if (state.ok) toast({ type: "success", message: "Команди згенеровано" });
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && <Alert variant="error">{state.message}</Alert>}

      {notReadyCount > 0 ? (
        <Alert variant="error">
          <b>{notReadyCount}</b> з {memberCount} учасників мають незаповнену анкету. Розподіл
          заблоковано, поки не заповните характеристики всіх (потрібні для чесного балансу).
        </Alert>
      ) : (
        <Alert variant="info">
          Буде розподілено <b>{memberCount}</b> учасників. Поточні загони будуть{" "}
          <b>замінені</b> новими.
        </Alert>
      )}

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>

      <SubmitButton className="w-full" size="lg" disabled={notReadyCount > 0}>
        <Shuffle className="size-5" />
        Згенерувати команди
      </SubmitButton>
    </form>
  );
}
