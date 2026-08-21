"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PhoneNumberField } from "./PhoneNumberField";
import { useTranslation } from "@/i18n/LocaleProvider";

interface PhoneStepProps {
  dialCode: string;
  localNumber: string;
  onDialCodeChange: (value: string) => void;
  onLocalNumberChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
  fieldHelperText?: string;
  submitLabel?: string;
  submitBusyLabel?: string;
  note?: string;
}

export function PhoneStep({
  dialCode,
  localNumber,
  onDialCodeChange,
  onLocalNumberChange,
  onSubmit,
  isSubmitting,
  error,
  fieldHelperText,
  submitLabel,
  submitBusyLabel,
  note,
}: PhoneStepProps) {
  const { t } = useTranslation();
  const resolvedSubmitLabel = submitLabel ?? t("auth.sendCode");
  const resolvedSubmitBusyLabel = submitBusyLabel ?? t("auth.sendingCode");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    onSubmit();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PhoneNumberField
        dialCode={dialCode}
        localNumber={localNumber}
        onDialCodeChange={onDialCodeChange}
        onLocalNumberChange={onLocalNumberChange}
        error={error}
        disabled={isSubmitting}
        helperText={fieldHelperText}
      />
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? resolvedSubmitBusyLabel : resolvedSubmitLabel}
      </Button>
      {note && <p className="text-center text-xs text-ink-400">{note}</p>}
    </form>
  );
}
