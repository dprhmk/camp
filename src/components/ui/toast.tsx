"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; type: "success" | "error"; message: string };

const ToastContext = React.createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function useToast() {
  return React.useContext(ToastContext);
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg",
              t.type === "success"
                ? "bg-green-50 text-green-900 border-green-200"
                : "bg-red-50 text-red-900 border-red-200",
            )}
            role="status"
          >
            {t.type === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="size-5 shrink-0 text-red-600" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Закрити">
              <X className="size-4 opacity-60" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
