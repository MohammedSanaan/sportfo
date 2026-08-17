"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthErrorMessage } from "@/lib/supabase/auth-errors";
import { lookupOwnAthleteProfile } from "@/lib/athlete/lookup-profile";
import { resolveAthleteDestination } from "@/lib/athlete/resolve-destination";
import { DEFAULT_COUNTRY } from "@/lib/phone/countries";
import { isValidE164, maskPhoneNumber, toE164 } from "@/lib/phone/e164";
import { PhoneStep } from "./PhoneStep";
import { OtpStep } from "./OtpStep";

const RESEND_COOLDOWN_SECONDS = 30;

type Step = "phone" | "otp";

export function AuthFlow() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [step, setStep] = useState<Step>("phone");
  const [dialCode, setDialCode] = useState(DEFAULT_COUNTRY.dialCode);
  const [localNumber, setLocalNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState<string>();
  const [otpError, setOtpError] = useState<string>();
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendCode() {
    const e164Phone = toE164(dialCode, localNumber);
    if (!isValidE164(e164Phone)) {
      setPhoneError("Enter a valid mobile number.");
      return;
    }

    setPhoneError(undefined);
    setIsSendingCode(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164Phone });
    setIsSendingCode(false);

    if (error) {
      console.error("signInWithOtp failed:", error);
      setPhoneError(friendlyAuthErrorMessage(error));
      return;
    }

    setOtp("");
    setOtpError(undefined);
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setStep("otp");
  }

  async function resendCode() {
    if (cooldown > 0 || isResending) return;

    const e164Phone = toE164(dialCode, localNumber);
    setIsResending(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164Phone });
    setIsResending(false);

    if (error) {
      console.error("resend signInWithOtp failed:", error);
      setOtpError(friendlyAuthErrorMessage(error));
      return;
    }

    setOtpError(undefined);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function verifyCode() {
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }

    const e164Phone = toE164(dialCode, localNumber);
    setOtpError(undefined);
    setIsVerifying(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164Phone,
      token: otp,
      type: "sms",
    });

    if (error || !data.session || !data.user) {
      console.error("verifyOtp failed:", error);
      setIsVerifying(false);
      setOtpError(
        error
          ? friendlyAuthErrorMessage(error)
          : "That code isn't right. Double-check it and try again.",
      );
      return;
    }

    // Don't trust verifyOtp's response alone -- re-confirm with Supabase
    // Auth that a real, valid session now exists before routing anywhere.
    const { data: userCheck, error: userCheckError } =
      await supabase.auth.getUser();

    if (userCheckError || !userCheck.user) {
      console.error("post-verify session check failed:", userCheckError);
      setIsVerifying(false);
      setOtpError("We couldn't confirm your session. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await lookupOwnAthleteProfile(
      supabase,
      userCheck.user.id,
    );

    setIsVerifying(false);

    if (profileError) {
      console.error("athlete profile lookup failed:", profileError);
      // Authenticated but the lookup itself failed -- registration is
      // always a safe destination to fall back to.
      router.push("/athlete/register");
      router.refresh();
      return;
    }

    router.push(resolveAthleteDestination(profile));
    router.refresh();
  }

  function changeNumber() {
    setStep("phone");
    setOtp("");
    setOtpError(undefined);
  }

  if (step === "otp") {
    return (
      <OtpStep
        maskedPhone={maskPhoneNumber(dialCode, localNumber)}
        otp={otp}
        onOtpChange={setOtp}
        onVerify={verifyCode}
        onResend={resendCode}
        onChangeNumber={changeNumber}
        isVerifying={isVerifying}
        isResending={isResending}
        cooldown={cooldown}
        error={otpError}
      />
    );
  }

  return (
    <PhoneStep
      dialCode={dialCode}
      localNumber={localNumber}
      onDialCodeChange={setDialCode}
      onLocalNumberChange={setLocalNumber}
      onSubmit={sendCode}
      isSubmitting={isSendingCode}
      error={phoneError}
    />
  );
}
