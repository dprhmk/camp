import * as React from "react";
import { Loader2, AlertCircle, CheckCircle2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-brand-600", className)} />;
}

/** Full-area loading indicator for pages/sections. */
export function Loading({ label = "Завантаження…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner className="size-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Alert({
  variant = "error",
  children,
  className,
}: {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  }[variant];
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={cn("flex items-start gap-2 rounded-xl border px-4 py-3 text-sm", styles, className)}>
      <Icon className="size-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/** Friendly empty state with an optional action. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-slate-100">
        <Icon className="size-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="max-w-xs text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
