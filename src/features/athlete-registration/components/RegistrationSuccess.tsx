"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { useTranslation } from "@/i18n/LocaleProvider";

interface RegistrationSuccessProps {
  // Already assigned at this account's very first login (see
  // ensure_sportfo_id() / AuthFlow.tsx) -- this screen only displays it,
  // never generates or changes it, so showing this same screen again on a
  // later resubmission is safe and shows the identical id.
  sportfoId: string | null;
}

export function RegistrationSuccess({ sportfoId }: RegistrationSuccessProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t("register.success.title")}>
      <div className="flex flex-col items-start gap-4">
        {sportfoId && (
          <div className="w-full rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-base font-semibold text-brand-800">{t("register.success.welcome")}</p>
            <p className="mt-3 text-xs font-medium tracking-wide text-brand-700 uppercase">
              {t("register.success.yourSportfoId")}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-wide text-ink-900">{sportfoId}</p>
            <p className="mt-3 text-sm text-brand-700">{t("register.success.sportfoIdHelper")}</p>
          </div>
        )}

        <p className="text-base text-ink-700">{t("register.success.message")}</p>
        <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
          <Link href="/" className="sm:w-auto">
            <Button type="button" variant="secondary">
              {t("register.success.backHome")}
            </Button>
          </Link>
          <Link href="/athlete/profile" className="sm:w-auto">
            <Button type="button" variant="primary">
              {t("register.success.viewProfile")}
            </Button>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
