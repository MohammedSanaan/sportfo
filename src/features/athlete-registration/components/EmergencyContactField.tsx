"use client";

import { cn } from "@/lib/cn";
import { FieldShell } from "@/components/ui/FieldShell";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/phone/countries";
import { toE164 } from "@/lib/phone/e164";
import { useTranslation } from "@/i18n/LocaleProvider";

interface EmergencyContactFieldProps {
  /** Stored/submitted as a single E.164 string (or "" if left blank) --
   * same "one normalized string in form state" shape as the readonly
   * Mobile Number field, just editable and optional. */
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

// Longest-dial-code-first so e.g. "+1" doesn't shadow-match a value that
// actually starts with a longer code sharing that prefix.
const COUNTRIES_BY_DIAL_CODE_LENGTH = [...COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length,
);

function splitE164(value: string): { dialCode: string; localNumber: string } {
  if (!value) return { dialCode: DEFAULT_COUNTRY.dialCode, localNumber: "" };
  const match = COUNTRIES_BY_DIAL_CODE_LENGTH.find((country) => value.startsWith(country.dialCode));
  if (!match) return { dialCode: DEFAULT_COUNTRY.dialCode, localNumber: value.replace(/^\+/, "") };
  return { dialCode: match.dialCode, localNumber: value.slice(match.dialCode.length) };
}

// The same dial-code-select + number-input pattern used on /auth (see
// PhoneNumberField), reused here as a small, purpose-built field rather
// than importing that component directly -- it's tightly coupled to the
// login flow's own id/label/SportFo-ID-hybrid-input concerns. This shares
// the same underlying country list and E.164 utilities instead of
// inventing a second phone system.
export function EmergencyContactField({
  value,
  onChange,
  onBlur,
  error,
}: EmergencyContactFieldProps) {
  const { t } = useTranslation();
  const { dialCode, localNumber } = splitE164(value);

  function commit(nextDialCode: string, nextLocalNumber: string) {
    // Blank local number always commits to "" -- a dial code alone (e.g.
    // just switching the country dropdown before typing anything) must
    // never read as "a phone number was entered."
    onChange(nextLocalNumber ? toE164(nextDialCode, nextLocalNumber) : "");
  }

  return (
    <FieldShell
      label={t("register.personal.emergencyContact")}
      htmlFor="emergencyContact"
      optional
      error={error}
      helperText={error ? undefined : t("register.personal.emergencyContactHelper")}
    >
      <div className="flex gap-2">
        <select
          aria-label={t("auth.countryCodeLabel")}
          value={dialCode}
          onChange={(e) => commit(e.target.value, localNumber)}
          onBlur={onBlur}
          className={cn(
            "h-12 w-[7.5rem] shrink-0 rounded-xl border bg-surface px-2 text-sm text-ink-900",
            error ? "border-red-400" : "border-border-default",
            "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
          )}
        >
          {COUNTRIES.map((country) => (
            <option key={country.iso2} value={country.dialCode}>
              {country.flag} {country.dialCode}
            </option>
          ))}
        </select>
        <input
          id="emergencyContact"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={t("register.personal.emergencyContactPlaceholder")}
          value={localNumber}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "emergencyContact-error" : undefined}
          onChange={(e) => commit(dialCode, e.target.value.replace(/\D/g, "").slice(0, 14))}
          onBlur={onBlur}
          className={cn(
            "h-12 w-full rounded-xl border bg-surface px-3.5 text-sm text-ink-900 placeholder:text-ink-400",
            error ? "border-red-400" : "border-border-default",
            "transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
          )}
        />
      </div>
    </FieldShell>
  );
}
