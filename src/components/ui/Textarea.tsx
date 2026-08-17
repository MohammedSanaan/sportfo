import type { Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FieldShell } from "./FieldShell";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  id,
  optional,
  helperText,
  error,
  className,
  rows = 4,
  ref,
  ...textareaProps
}: TextareaProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      optional={optional}
      helperText={helperText}
      error={error}
    >
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full resize-y rounded-lg border bg-surface px-3.5 py-3 text-sm text-ink-900 placeholder:text-ink-400",
          error ? "border-red-400" : "border-border-default",
          "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
          className,
        )}
        {...textareaProps}
      />
    </FieldShell>
  );
}
