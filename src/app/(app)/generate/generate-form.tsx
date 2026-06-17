"use client";

import * as React from "react";
import { useActionState } from "react";
import { Shuffle } from "lucide-react";
import { generateTeamsAction } from "@/lib/actions/generate";
import { initialActionState } from "@/lib/actions/types";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";
import { useToast } from "@/components/ui/toast";

type Leader = { id: string; name: string };

export function GenerateForm({
  memberCount,
  notReadyCount,
  leaders,
}: {
  memberCount: number;
  notReadyCount: number;
  leaders: Leader[];
}) {
  const [count, setCount] = React.useState(4);
  // Selected leader account id per squad ("" = none).
  const [selected, setSelected] = React.useState<string[]>([]);
  const [state, formAction] = useActionState(generateTeamsAction, initialActionState);
  const toast = useToast();

  React.useEffect(() => {
    if (state.ok) toast({ type: "success", message: "Команди згенеровано" });
  }, [state, toast]);

  // Only the currently visible squad slots count toward "already taken".
  const visible = Array.from({ length: count }, (_, i) => selected[i] ?? "");

  function setAt(index: number, value: string) {
    setSelected((prev) => {
      const next = [...prev];
      while (next.length < count) next.push("");
      next[index] = value;
      return next;
    });
  }

  // Leaders chosen in the OTHER slots — hidden from this slot's options.
  function optionsFor(index: number) {
    const takenElsewhere = new Set(visible.filter((id, j) => j !== index && id));
    return leaders.filter((l) => l.id === visible[index] || !takenElsewhere.has(l.id));
  }

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
          <b>замінені</b> новими. Виконуйте на старті сезону.
        </Alert>
      )}

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
            <p className="text-sm font-medium text-slate-700">
              Вожаті загонів{" "}
              <span className="font-normal text-slate-400">(необовʼязково)</span>
            </p>
            {leaders.length === 0 ? (
              <p className="text-sm text-slate-500">
                Немає акаунтів вожатих. Створіть їх у розділі «Акаунти».
              </p>
            ) : (
              Array.from({ length: count }, (_, i) => (
                <Select
                  key={i}
                  name="leaderUserIds"
                  aria-label={`Вожатий загону ${i + 1}`}
                  value={visible[i]}
                  onChange={(e) => setAt(i, e.target.value)}
                >
                  <option value="">Загін {i + 1} — вожатий не вибраний</option>
                  {optionsFor(i).map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <SubmitButton className="w-full" size="lg" disabled={notReadyCount > 0}>
        <Shuffle className="size-5" />
        Згенерувати команди
      </SubmitButton>
    </form>
  );
}
