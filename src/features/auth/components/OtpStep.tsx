"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface OtpStepProps {
  maskedPhone: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeNumber: () => void;
  isVerifying: boolean;
  isResending: boolean;
  cooldown: number;
  error?: string;
}

export function OtpStep({
  maskedPhone,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  onChangeNumber,
  isVerifying,
  isResending,
  cooldown,
  error,
}: OtpStepProps) {
  const busy = isVerifying || isResending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    onVerify();
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-sm text-ink-500">
        Enter the 6-digit code we sent to{" "}
        <span className="font-medium text-ink-800">{maskedPhone}</span>.
      </p>

      <Input
        id="otp-code"
        label="Verification code"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        value={otp}
        disabled={busy}
        error={error}
        onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="text-center text-lg tracking-[0.5em]"
      />

      <Button type="submit" variant="primary" disabled={busy || otp.length !== 6}>
        {isVerifying ? "Verifying..." : "Verify code"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onChangeNumber}
          disabled={busy}
          className="font-medium text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Change mobile number
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={busy || cooldown > 0}
          className="font-medium text-brand-700 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending
            ? "Resending..."
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
        </button>
      </div>
    </form>
  );
}
