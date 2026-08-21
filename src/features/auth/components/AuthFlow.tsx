"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthErrorMessage } from "@/lib/supabase/auth-errors";
import { lookupOwnAthleteProfile } from "@/lib/athlete/lookup-profile";
import { resolveAthleteDestination } from "@/lib/athlete/resolve-destination";
import { getAuthMode, DEMO_PHONE_METADATA_KEY } from "@/lib/auth-mode";
import { DEFAULT_COUNTRY } from "@/lib/phone/countries";
import { isValidE164, maskPhoneNumber, toE164 } from "@/lib/phone/e164";
import { PhoneStep } from "./PhoneStep";
import { OtpStep } from "./OtpStep";

const RESEND_COOLDOWN_SECONDS = 30;

type Step = "phone" | "otp";

export function AuthFlow() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [authMode] = useState(() => getAuthMode());

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

  // After either flow produces a real authenticated session, routing is
  // identical: look up the athlete's own profile (RLS-scoped) and land
  // them on the right destination. router.refresh() forces the header's
  // server-rendered auth state to pick up the new session immediately
  // (see Header/AuthNav -- they don't otherwise re-render on client nav).
  async function routeAfterAuthentication(userId: string) {
    const { data: profile, error: profileError } = await lookupOwnAthleteProfile(
      supabase,
      userId,
    );

    if (profileError) {
      console.error("athlete profile lookup failed:", profileError);
      router.push("/athlete/register");
      router.refresh();
      return;
    }

    router.push(resolveAthleteDestination(profile));
    router.refresh();
  }

  async function continueDemo() {
    const e164Phone = toE164(dialCode, localNumber);
    if (!isValidE164(e164Phone)) {
      setPhoneError("Enter a valid mobile number.");
      return;
    }

    setPhoneError(undefined);
    setIsSendingCode(true);

    // Creates a real Supabase Auth session (a real auth.uid(), scoped by
    // the same RLS policies as a phone-verified user) -- not a fake
    // frontend-only login. The phone itself is unverified in this mode, so
    // it's stored in user_metadata rather than the `phone` column Supabase
    // reserves for verified numbers.
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error || !data.session || !data.user) {
      console.error("signInAnonymously failed:", error);
      setIsSendingCode(false);
      setPhoneError(friendlyAuthErrorMessage(error ?? new Error("No session returned")));
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { [DEMO_PHONE_METADATA_KEY]: e164Phone },
    });

    if (updateError) {
      console.error("updateUser (demo phone metadata) failed:", updateError);
      setIsSendingCode(false);
      setPhoneError(friendlyAuthErrorMessage(updateError));
      return;
    }

    await routeAfterAuthentication(data.user.id);
    setIsSendingCode(false);
  }

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

    await routeAfterAuthentication(userCheck.user.id);
    setIsVerifying(false);
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

  if (authMode === "demo") {
    return (
      <PhoneStep
        dialCode={dialCode}
        localNumber={localNumber}
        onDialCodeChange={setDialCode}
        onLocalNumberChange={setLocalNumber}
        onSubmit={continueDemo}
        isSubmitting={isSendingCode}
        error={phoneError}
        fieldHelperText="We'll use this number for your athlete profile."
        submitLabel="Continue"
        submitBusyLabel="Continuing..."
        note="Phone verification will be enabled before public launch."
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
