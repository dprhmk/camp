"use client";

import * as React from "react";
import { initialActionState, type ActionState } from "@/lib/actions/types";

/**
 * Drives a dialog-bound form action: runs the action in a transition, stores
 * its result, and closes the dialog on success — all inside the submit handler
 * (no setState-in-effect). `pending` powers the submit button's loading state.
 */
export function useDialogAction(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<ActionState>(initialActionState);
  const [pending, startTransition] = React.useTransition();

  const formAction = React.useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        // The actions here don't read prev state; pass the initial value and
        // keep this callback stable (no dependency on the changing `state`).
        const result = (await action(initialActionState, formData)) ?? {};
        setState(result);
        if (result.ok) setOpen(false);
      });
    },
    [action],
  );

  return { open, setOpen, state, formAction, pending };
}
