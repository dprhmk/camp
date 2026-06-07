"use client";

import { Trash2 } from "lucide-react";
import { deleteMemberAction } from "@/lib/actions/members";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DeleteMemberButton({ id }: { id: string }) {
  return (
    <ConfirmDialog
      title="Видалити учасника?"
      description="Анкету учасника буде видалено назавжди. Цю дію не можна скасувати."
      confirmLabel="Видалити"
      onConfirm={() => deleteMemberAction(id)}
      trigger={
        <Button size="sm" variant="ghost" className="text-red-600">
          <Trash2 className="size-5" />
        </Button>
      }
    />
  );
}
