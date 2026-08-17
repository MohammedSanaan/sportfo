import type { Ref, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import type { SelectOption } from "@/types/athlete";
import { FieldShell } from "./FieldShell";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  label,
  id,
  optional,
  helperText,
  error,
  options,
  placeholder = "Select an option",
  className,
  ref,
  ...selectProps
}: SelectProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={id}
      optional={optional}
      helperText={helperText}
      error={error}
    >
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink-900",
          error ? "border-red-400" : "border-border-default",
          "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
          className,
        )}
        {...selectProps}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
