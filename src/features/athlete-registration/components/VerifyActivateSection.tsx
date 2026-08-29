"use client";

import type { ReactNode } from "react";
import { SectionCard } from "@/components/ui/SectionCard";
import { VerifyIcon } from "@/components/ui/RegistrationIcons";
import { useTranslation } from "@/i18n/LocaleProvider";

interface PaymentMethod {
  key: "upi" | "card" | "netBanking";
  icon: ReactNode;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { key: "upi", icon: <UpiIcon /> },
  { key: "card", icon: <CardIcon /> },
  { key: "netBanking", icon: <BankIcon /> },
];

// Verify & Activate is intentionally the LAST section and does not collect
// any payment details -- SportFo has no real, integrated payment gateway
// today (see the migration/report for this phase), so this only ever
// displays the three intended payment methods as disabled "Coming Soon"
// cards. There is no submit control here and no fake "payment successful"
// state: completing the registration form (Save Draft / Create Athlete
// Profile in FormActions, further down the page) is the only thing this
// step actually does. Registration completion, payment, identity
// verification, and certificate verification are four separate, never-
// conflated states -- see the athlete_achievements.verification_status
// column and admin_set_achievement_verification_status RPC for the one
// verification concept that does exist today.
export function VerifyActivateSection() {
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t("register.verify.title")}
      description={t("register.verify.description")}
      icon={<VerifyIcon />}
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("register.verify.comingSoonNotice")}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.key}
              aria-disabled
              className="flex flex-col items-center gap-3 rounded-xl border border-border-default bg-surface-muted px-4 py-6 text-center opacity-70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink-400">
                {method.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-700">
                  {t(`register.verify.methods.${method.key}`)}
                </p>
                <p className="mt-1 text-xs font-medium text-ink-400">
                  {t("register.verify.comingSoonBadge")}
                </p>
              </div>
            </div>
          ))}
        </div>

        <dl className="grid grid-cols-1 gap-3 rounded-xl border border-border-default bg-surface p-4 text-sm sm:grid-cols-2">
          <StatusRow label={t("register.verify.status.registration")} value={t("register.verify.status.registrationValue")} />
          <StatusRow label={t("register.verify.status.payment")} value={t("register.verify.status.pendingValue")} />
          <StatusRow label={t("register.verify.status.identity")} value={t("register.verify.status.pendingValue")} />
          <StatusRow label={t("register.verify.status.certificates")} value={t("register.verify.status.reviewValue")} />
        </dl>
      </div>
    </SectionCard>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-800">{value}</dd>
    </div>
  );
}

function UpiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path d="M4 12h16M4 12l5-5M4 12l5 5M20 12l-5-5M20 12l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path d="M3 10l9-5 9 5M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
