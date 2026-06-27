import type { FieldProps, InputProps, SelectProps, TextareaProps } from "./types";

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="grid gap-1 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none ring-primary/20 transition focus:ring-4 ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`min-h-24 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-4 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`h-11 rounded-md border border-border bg-surface px-3 text-sm outline-none ring-primary/20 transition focus:ring-4 ${className}`}
      {...props}
    />
  );
}
