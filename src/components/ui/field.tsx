import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  children,
  required,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("block text-sm font-medium text-slate-700", className)} {...props}>
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

/** A labelled field with optional hint and inline error message. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 cursor-pointer hover:bg-slate-50">
      <input
        type="checkbox"
        className={cn("size-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500", className)}
        {...props}
      />
      <span className="text-base text-slate-800">{label}</span>
    </label>
  );
}
