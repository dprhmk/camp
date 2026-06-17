"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Users, Shield, Check, Trash2, X } from "lucide-react";
import { useActionState } from "react";
import { createCampAction, switchCampAction, deleteCampAction } from "@/lib/actions/camps";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/form/submit-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type CampCard = {
  id: string;
  name: string;
  year: number;
  description: string | null;
  members: number;
  squads: number;
};

export function CreateCampDialog() {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(createCampAction, initialActionState);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm">
          <Plus className="size-5" />
          Новий
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl focus:outline-none max-h-[90vh]">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">Новий табір</Dialog.Title>
            <Dialog.Close aria-label="Закрити">
              <X className="size-5 text-slate-400" />
            </Dialog.Close>
          </div>
          <form action={formAction} className="space-y-4" noValidate>
            {state.message && <Alert variant="error">{state.message}</Alert>}
            <Field label="Назва" htmlFor="name" required error={state.fieldErrors?.name}>
              <Input id="name" name="name" placeholder="Табір 2026" aria-invalid={!!state.fieldErrors?.name} />
            </Field>
            <Field label="Рік" htmlFor="year" required error={state.fieldErrors?.year}>
              <Input id="year" name="year" type="number" inputMode="numeric" defaultValue={2026} aria-invalid={!!state.fieldErrors?.year} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Початок" htmlFor="startDate" error={state.fieldErrors?.startDate}>
                <Input id="startDate" name="startDate" type="date" />
              </Field>
              <Field label="Кінець" htmlFor="endDate" error={state.fieldErrors?.endDate}>
                <Input id="endDate" name="endDate" type="date" />
              </Field>
            </div>
            <Field label="Опис" htmlFor="description" error={state.fieldErrors?.description}>
              <Textarea id="description" name="description" placeholder="Короткий опис сезону" />
            </Field>
            <SubmitButton className="w-full">Створити і перейти</SubmitButton>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CampList({
  camps,
  activeCampId,
  canDelete,
}: {
  camps: CampCard[];
  activeCampId: string | null;
  canDelete: boolean;
}) {
  return (
    <div className="space-y-3">
      {camps.map((camp) => {
        const active = camp.id === activeCampId;
        return (
          <Card key={camp.id} className={active ? "ring-2 ring-brand-500" : undefined}>
            <CardContent className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-slate-900">{camp.name}</h3>
                  {active && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Активний
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-sm text-slate-500">{camp.year}</div>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {camp.members}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="size-3.5" />
                    {camp.squads}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {active ? (
                  <Button size="sm" variant="secondary" disabled>
                    <Check className="size-4" />
                    Обрано
                  </Button>
                ) : (
                  <form action={switchCampAction.bind(null, camp.id)}>
                    <SubmitButton size="sm" className="w-full">
                      Обрати
                    </SubmitButton>
                  </form>
                )}
                {canDelete && (
                  <ConfirmDialog
                    title="Видалити табір?"
                    description={`Табір «${camp.name}» і всі його дані (учасники, загони, розклад) будуть видалені назавжди.`}
                    confirmLabel="Видалити"
                    onConfirm={() => deleteCampAction(camp.id)}
                    trigger={
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="size-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
