import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/cn";
import { FieldShell } from "./FieldShell";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  id,
  optional,
  helperText,
  error,
  className,
  ref,
  ...inputProps
}: InputProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      optional={optional}
      helperText={helperText}
      error={error}
    >
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink-900 placeholder:text-ink-400",
          error ? "border-red-400" : "border-border-default",
          "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
          className,
        )}
        {...inputProps}
      />
    </FieldShell>
  );
}
