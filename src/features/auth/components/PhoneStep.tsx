"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PhoneNumberField } from "./PhoneNumberField";

interface PhoneStepProps {
  dialCode: string;
  localNumber: string;
  onDialCodeChange: (value: string) => void;
  onLocalNumberChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function PhoneStep({
  dialCode,
  localNumber,
  onDialCodeChange,
  onLocalNumberChange,
  onSubmit,
  isSubmitting,
  error,
}: PhoneStepProps) {
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
      />
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending code..." : "Send verification code"}
      </Button>
    </form>
  );
}
