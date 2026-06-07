"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, X, UserCog } from "lucide-react";
import { createUserAction, updateUserAction, deleteUserAction } from "@/lib/actions/users";
import { type ActionState } from "@/lib/actions/types";
import { useDialogAction } from "@/lib/use-dialog-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROLE_LABEL, ROLE_OPTIONS, type Role } from "@/lib/enums";

type UserRow = { id: string; name: string; email: string; role: string };

export function UsersView({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <Card key={u.id}>
          <CardContent className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-slate-900">{u.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {ROLE_LABEL[u.role as Role] ?? u.role}
                </span>
              </div>
              <div className="truncate text-sm text-slate-500">{u.email}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <UserDialog user={u} />
              {u.id !== currentUserId && (
                <ConfirmDialog
                  title="Видалити акаунт?"
                  description={`Акаунт «${u.name}» буде видалено. Загони, де він був вожатим, залишаться без привʼязки.`}
                  confirmLabel="Видалити"
                  onConfirm={() => deleteUserAction(u.id)}
                  trigger={
                    <Button size="icon" variant="ghost" className="size-9 text-red-600">
                      <Trash2 className="size-4" />
                    </Button>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {users.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
          <UserCog className="size-8" />
          <p className="text-sm">Ще немає акаунтів</p>
        </div>
      )}
    </div>
  );
}

function UserFields({ state, user }: { state: ActionState; user?: UserRow }) {
  const err = state.fieldErrors ?? {};
  return (
    <>
      {state.message && <Alert variant="error">{state.message}</Alert>}
      <Field label="Імʼя" htmlFor="name" required error={err.name}>
        <Input id="name" name="name" defaultValue={user?.name} aria-invalid={!!err.name} />
      </Field>
      <Field label="Email" htmlFor="email" required error={err.email}>
        <Input id="email" name="email" type="email" defaultValue={user?.email} aria-invalid={!!err.email} />
      </Field>
      <Field label="Роль" htmlFor="role" required error={err.role}>
        <Select id="role" name="role" defaultValue={user?.role ?? "LEADER"}>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label={user ? "Новий пароль" : "Пароль"}
        htmlFor="password"
        required={!user}
        hint={user ? "Залиште порожнім, щоб не змінювати" : "Щонайменше 6 символів"}
        error={err.password}
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!err.password} />
      </Field>
    </>
  );
}

export function CreateUserDialog() {
  const { open, setOpen, state, formAction, pending } = useDialogAction(createUserAction);

  return (
    <Shell
      open={open}
      onOpenChange={setOpen}
      title="Новий акаунт"
      trigger={
        <Button size="sm">
          <Plus className="size-5" />
          Акаунт
        </Button>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        <UserFields state={state} />
        <Button type="submit" loading={pending} className="w-full">
          Створити
        </Button>
      </form>
    </Shell>
  );
}

function UserDialog({ user }: { user: UserRow }) {
  const action = React.useMemo(() => updateUserAction.bind(null, user.id), [user.id]);
  const { open, setOpen, state, formAction, pending } = useDialogAction(action);

  return (
    <Shell
      open={open}
      onOpenChange={setOpen}
      title="Редагувати акаунт"
      trigger={
        <Button size="icon" variant="ghost" className="size-9">
          <Pencil className="size-4" />
        </Button>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        <UserFields state={state} user={user} />
        <Button type="submit" loading={pending} className="w-full">
          Зберегти
        </Button>
      </form>
    </Shell>
  );
}

function Shell({
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
