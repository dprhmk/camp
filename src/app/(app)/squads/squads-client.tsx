"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, Crown, Users, X, Check } from "lucide-react";
import { createSquadAction, updateSquadAction, deleteSquadAction } from "@/lib/actions/squads";
import { type ActionState } from "@/lib/actions/types";
import { useDialogAction } from "@/lib/use-dialog-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SQUAD_COLORS } from "@/lib/enums";
import { cn } from "@/lib/utils";

type Squad = {
  id: string;
  name: string;
  color: string;
  leaderUserId: string | null;
  leaderName: string | null;
  assistantName: string | null;
  totalPhysical: number;
  totalMental: number;
  members: number;
  canManage: boolean;
};
type Leader = { id: string; name: string };

export function SquadsView({
  squads,
  leaders,
  canChangeLeader,
  canDelete,
  maxTotal,
}: {
  squads: Squad[];
  leaders: Leader[];
  canChangeLeader: boolean;
  canDelete: boolean;
  maxTotal: number;
}) {
  return (
    <div className="space-y-3">
      {squads.map((s) => (
        <Card key={s.id}>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 size-5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-slate-900">{s.name}</h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" /> {s.members}
                  </span>
                  {s.leaderName && (
                    <span className="inline-flex items-center gap-1">
                      <Crown className="size-3.5 text-amber-500" /> {s.leaderName}
                    </span>
                  )}
                  {s.assistantName && <span>Помічник: {s.assistantName}</span>}
                </div>
              </div>
              {s.canManage && (
                <div className="flex shrink-0 gap-1">
                  <EditSquadDialog squad={s} leaders={leaders} canChangeLeader={canChangeLeader} />
                  {canDelete && (
                    <ConfirmDialog
                      title="Видалити загін?"
                      description={`Загін «${s.name}» буде видалено. Його учасники залишаться в таборі без загону.`}
                      confirmLabel="Видалити"
                      onConfirm={() => deleteSquadAction(s.id)}
                      trigger={
                        <Button size="icon" variant="ghost" className="size-9 text-red-600">
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </div>

            <BalanceBar label="Фізичні" value={s.totalPhysical} max={maxTotal} color="#0ea5e9" />
            <BalanceBar label="Ментальні" value={s.totalMental} max={maxTotal} color="#a855f7" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BalanceBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-700">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// --- Create / edit dialogs -------------------------------------------------

function ColorPicker({ name, defaultColor }: { name: string; defaultColor: string }) {
  const [color, setColor] = React.useState(defaultColor);
  return (
    <div>
      <input type="hidden" name={name} value={color} />
      <div className="flex flex-wrap gap-2">
        {SQUAD_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              color.toLowerCase() === c.toLowerCase() && "ring-2 ring-offset-2 ring-slate-400",
            )}
            style={{ backgroundColor: c }}
            aria-label={c}
          >
            {color.toLowerCase() === c.toLowerCase() && <Check className="size-4 text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function SquadFormFields({
  state,
  squad,
  leaders,
  canChangeLeader,
}: {
  state: ActionState;
  squad?: Squad;
  leaders: Leader[];
  canChangeLeader: boolean;
}) {
  const err = state.fieldErrors ?? {};
  return (
    <>
      {state.message && <Alert variant="error">{state.message}</Alert>}
      <Field label="Назва" htmlFor="name" required error={err.name}>
        <Input id="name" name="name" defaultValue={squad?.name} placeholder="Загін 1" aria-invalid={!!err.name} />
      </Field>
      <Field label="Колір" error={err.color}>
        <ColorPicker name="color" defaultColor={squad?.color ?? SQUAD_COLORS[0]} />
      </Field>
      <Field label="ПІБ вожатого" htmlFor="leaderName" error={err.leaderName}>
        <Input id="leaderName" name="leaderName" defaultValue={squad?.leaderName ?? ""} />
      </Field>
      <Field label="ПІБ помічника" htmlFor="assistantName" error={err.assistantName}>
        <Input id="assistantName" name="assistantName" defaultValue={squad?.assistantName ?? ""} />
      </Field>
      {canChangeLeader && (
        <Field label="Акаунт вожатого" htmlFor="leaderUserId" hint="Привʼязка до особистого акаунта">
          <select
            id="leaderUserId"
            name="leaderUserId"
            defaultValue={squad?.leaderUserId ?? ""}
            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">— не привʼязано —</option>
            {leaders.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
      )}
    </>
  );
}

function DialogShell({
  open,
  onOpenChange,
  title,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Close aria-label="Закрити">
              <X className="size-5 text-slate-400" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CreateSquadDialog({ leaders, canChangeLeader }: { leaders: Leader[]; canChangeLeader: boolean }) {
  const { open, setOpen, state, formAction, pending } = useDialogAction(createSquadAction);

  return (
    <DialogShell
      open={open}
      onOpenChange={setOpen}
      title="Новий загін"
      trigger={
        <Button size="sm">
          <Plus className="size-5" />
          Загін
        </Button>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        <SquadFormFields state={state} leaders={leaders} canChangeLeader={canChangeLeader} />
        <Button type="submit" loading={pending} className="w-full">
          Створити
        </Button>
      </form>
    </DialogShell>
  );
}

function EditSquadDialog({
  squad,
  leaders,
  canChangeLeader,
}: {
  squad: Squad;
  leaders: Leader[];
  canChangeLeader: boolean;
}) {
  const action = React.useMemo(() => updateSquadAction.bind(null, squad.id), [squad.id]);
  const { open, setOpen, state, formAction, pending } = useDialogAction(action);

  return (
    <DialogShell
      open={open}
      onOpenChange={setOpen}
      title="Редагувати загін"
      trigger={
        <Button size="icon" variant="ghost" className="size-9">
          <Pencil className="size-4" />
        </Button>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        <SquadFormFields state={state} squad={squad} leaders={leaders} canChangeLeader={canChangeLeader} />
        <Button type="submit" loading={pending} className="w-full">
          Зберегти
        </Button>
      </form>
    </DialogShell>
  );
}
