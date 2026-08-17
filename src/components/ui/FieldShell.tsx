import type { ReactNode } from "react";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({
  label,
  htmlFor,
  optional = false,
  helperText,
  error,
  children,
}: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between text-sm font-medium text-ink-800"
      >
        <span>{label}</span>
        {optional && (
          <span className="text-xs font-normal text-ink-400">Optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        helperText && <p className="text-xs text-ink-400">{helperText}</p>
      )}
    </div>
  );
}
