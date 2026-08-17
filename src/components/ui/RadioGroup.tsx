import type { Ref } from "react";
import type { SelectOption } from "@/types/athlete";

interface RadioGroupProps {
  label: string;
  name: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  optional?: boolean;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  onBlur,
  optional = false,
  error,
  ref,
}: RadioGroupProps) {
  const errorId = `${name}-error`;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="flex w-full items-baseline justify-between text-sm font-medium text-ink-800">
        <span>{label}</span>
        {optional && (
          <span className="text-xs font-normal text-ink-400">Optional</span>
        )}
      </legend>
      <div
        role="radiogroup"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="flex flex-wrap gap-x-6 gap-y-2 pt-1"
      >
        {options.map((option, index) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-ink-700"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              onBlur={onBlur}
              ref={index === 0 ? ref : undefined}
              className="h-4 w-4 border-border-strong text-brand-600 focus:ring-2 focus:ring-brand-100"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
