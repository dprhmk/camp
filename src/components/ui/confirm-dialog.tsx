"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

/**
 * Confirmation dialog for dangerous actions. Wrap a trigger element and provide
 * an async onConfirm; the confirm button shows a loading state while it runs.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Підтвердити",
  cancelLabel = "Скасувати",
  variant = "danger",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex flex-col items-center text-center gap-3">
            {variant === "danger" && (
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="size-6 text-red-600" />
              </div>
            )}
            <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
            {description && (
              <Dialog.Description className="text-sm text-slate-500">
                {description}
              </Dialog.Description>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant={variant} onClick={handleConfirm} loading={loading}>
              {confirmLabel}
            </Button>
            <Dialog.Close asChild>
              <Button variant="ghost" disabled={loading}>
                {cancelLabel}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
