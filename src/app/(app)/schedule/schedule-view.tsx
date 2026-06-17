"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, Clock, X, CalendarDays } from "lucide-react";
import {
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
} from "@/lib/actions/schedule";
import { useDialogAction } from "@/lib/use-dialog-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Entry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  title: string;
  description: string | null;
};

const WEEKDAYS = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "Пʼятниця", "Субота"];

function dayLabel(iso: string) {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.toLocaleDateString("uk-UA", { day: "2-digit", month: "long" })}`;
}

export function ScheduleView({ entries, canEdit }: { entries: Entry[]; canEdit: boolean }) {
  // Group by calendar day.
  const groups = React.useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      const key = e.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <EntryDialog
            trigger={
              <Button size="sm">
                <Plus className="size-5" />
                Додати подію
              </Button>
            }
          />
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Розклад порожній"
          description={canEdit ? "Додайте першу подію дня." : "Директор ще не додав події."}
        />
      ) : (
        groups.map(([key, list]) => (
          <Card key={key}>
            <CardContent>
              <h2 className="mb-3 text-base font-semibold text-slate-900">{dayLabel(key)}</h2>
              <ul className="space-y-2">
                {list.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-white px-2 py-1 text-center shadow-sm">
                      <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-slate-900">
                        <Clock className="size-3" />
                        {e.startTime}
                      </span>
                      {e.endTime && <span className="text-xs text-slate-400">{e.endTime}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{e.title}</p>
                      {e.description && <p className="text-sm text-slate-500">{e.description}</p>}
                    </div>
                    {canEdit && (
                      <div className="flex shrink-0 gap-1">
                        <EntryDialog
                          entry={e}
                          trigger={
                            <Button size="icon" variant="ghost" className="size-9">
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          title="Видалити подію?"
                          confirmLabel="Видалити"
                          onConfirm={() => deleteScheduleAction(e.id)}
                          trigger={
                            <Button size="icon" variant="ghost" className="size-9 text-red-600">
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function EntryDialog({ entry, trigger }: { entry?: Entry; trigger: React.ReactNode }) {
  const action = React.useMemo(
    () => (entry ? updateScheduleAction.bind(null, entry.id) : createScheduleAction),
    [entry],
  );
  const { open, setOpen, state, formAction, pending } = useDialogAction(action);
  const err = state.fieldErrors ?? {};

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">
              {entry ? "Редагувати подію" : "Нова подія"}
            </Dialog.Title>
            <Dialog.Close aria-label="Закрити">
              <X className="size-5 text-slate-400" />
            </Dialog.Close>
          </div>
          <form action={formAction} className="space-y-4" noValidate>
            {state.message && <Alert variant="error">{state.message}</Alert>}
            <Field label="День" htmlFor="date" required error={err.date}>
              <Input id="date" name="date" type="date" defaultValue={entry?.date.slice(0, 10)} aria-invalid={!!err.date} />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Початок" htmlFor="startTime" required error={err.startTime}>
                <Input id="startTime" name="startTime" type="time" defaultValue={entry?.startTime} aria-invalid={!!err.startTime} />
              </Field>
              <Field label="Кінець" htmlFor="endTime" error={err.endTime}>
                <Input id="endTime" name="endTime" type="time" defaultValue={entry?.endTime ?? ""} aria-invalid={!!err.endTime} />
              </Field>
            </div>
            <Field label="Назва події" htmlFor="title" required error={err.title}>
              <Input id="title" name="title" defaultValue={entry?.title} placeholder="Сніданок" aria-invalid={!!err.title} />
            </Field>
            <Field label="Опис" htmlFor="description" error={err.description}>
              <Textarea id="description" name="description" defaultValue={entry?.description ?? ""} />
            </Field>
            <Button type="submit" loading={pending} className="w-full">
              {entry ? "Зберегти" : "Додати"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
