"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="size-8 text-red-600" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Щось пішло не так</h1>
      <p className="max-w-xs text-sm text-slate-500">
        Сталася неочікувана помилка. Спробуйте повторити дію.
      </p>
      <Button onClick={reset}>Спробувати знову</Button>
    </main>
  );
}
