"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { useTranslation } from "@/i18n/LocaleProvider";

export function RegistrationSuccess() {
  const { t } = useTranslation();

  return (
    <SectionCard title={t("register.success.title")}>
      <div className="flex flex-col items-start gap-4">
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
