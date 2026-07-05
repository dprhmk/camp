"use client";

import { useActionState } from "react";
import { Printer, Plus } from "lucide-react";
import { generatePoolCodesAction } from "@/lib/actions/codes";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()}>
      <Printer className="size-5" />
      Друк
    </Button>
  );
}

export function GenerateCodesForm({ defaultCount }: { defaultCount: number }) {
  const [state, formAction] = useActionState(generatePoolCodesAction, initialActionState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <Input
          name="count"
          type="number"
          inputMode="numeric"
          min={1}
          max={500}
          defaultValue={defaultCount}
          className="w-24"
          aria-label="Кількість кодів"
        />
        <SubmitButton>
          <Plus className="size-5" />
          Згенерувати
        </SubmitButton>
      </div>
      {state.message && (
        <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>
      )}
    </form>
  );
}
