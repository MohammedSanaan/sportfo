import { cn } from "@/lib/cn";
import { FieldShell } from "@/components/ui/FieldShell";
import { COUNTRIES } from "@/lib/phone/countries";

interface PhoneNumberFieldProps {
  dialCode: string;
  localNumber: string;
  onDialCodeChange: (value: string) => void;
  onLocalNumberChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  helperText?: string;
}

export function PhoneNumberField({
  dialCode,
  localNumber,
  onDialCodeChange,
  onLocalNumberChange,
  error,
  disabled,
  helperText = "We'll text a 6-digit code to this number.",
}: PhoneNumberFieldProps) {
  return (
    <FieldShell
      label="Mobile number"
      htmlFor="phone-number"
      error={error}
      helperText={error ? undefined : helperText}
    >
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={dialCode}
          disabled={disabled}
          onChange={(e) => onDialCodeChange(e.target.value)}
          className={cn(
            "h-12 w-[7.5rem] shrink-0 rounded-xl border bg-surface px-2 text-sm text-ink-900",
            error ? "border-red-400" : "border-border-default",
            "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {COUNTRIES.map((country) => (
            <option key={country.iso2} value={country.dialCode}>
              {country.flag} {country.dialCode}
            </option>
          ))}
        </select>
        <input
          id="phone-number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Mobile number"
          value={localNumber}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "phone-number-error" : undefined}
          onChange={(e) =>
            onLocalNumberChange(e.target.value.replace(/\D/g, "").slice(0, 14))
          }
          className={cn(
            "h-12 w-full rounded-xl border bg-surface px-3.5 text-sm text-ink-900 placeholder:text-ink-400",
            error ? "border-red-400" : "border-border-default",
            "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      </div>
    </FieldShell>
  );
}
