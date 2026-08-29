import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { CheckCircleIcon } from "@/components/ui/RegistrationIcons";
import { useTranslation } from "@/i18n/LocaleProvider";
import type { RegistrationCategoryConfig } from "@/lib/registration/categories";

interface RegistrationHubSuccessProps {
  category: RegistrationCategoryConfig;
  // Already assigned at this account's very first login (ensure_sportfo_id)
  // -- this screen only displays it, never generates or changes it, so
  // showing this same screen again on a later resubmission is safe and
  // shows the identical id. Never a new id per category (see
  // save_role_registration -- it only ever reads sportfo_users, never
  // writes it).
  sportfoId: string | null;
}

// Shown only after a real save_role_registration commit succeeds (see
// GenericCategoryForm) -- never a fake/optimistic success. Reused across
// all 7 non-Athlete categories; Athlete keeps its own existing
// RegistrationSuccess screen untouched.
export function RegistrationHubSuccess({ category, sportfoId }: RegistrationHubSuccessProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t("registerHub.success.title")}>
      <div className="flex flex-col items-start gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-500">
          <CheckCircleIcon className="h-9 w-9" />
        </span>

        {sportfoId && (
          <div className="w-full rounded-xl border border-brand-200 bg-brand-50 p-5">
            <p className="text-base font-semibold text-brand-800">
              {t(`registerHub.categories.${category.id}.successWelcome`)}
            </p>
            <p className="mt-3 text-xs font-medium tracking-wide text-brand-700 uppercase">
              {t("registerHub.success.yourSportfoId")}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-wide text-ink-900">{sportfoId}</p>
          </div>
        )}

        <p className="text-base text-ink-700">
          {t(`registerHub.categories.${category.id}.successMessage`)}
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link href={`/register/${category.slug}`} className="sm:w-auto">
            <Button type="button" variant="primary">
              {t("registerHub.actions.viewRegistration")}
            </Button>
          </Link>
          <Link href="/#community" className="sm:w-auto">
            <Button type="button" variant="secondary">
              {t("register.success.exploreCommunity")}
            </Button>
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
