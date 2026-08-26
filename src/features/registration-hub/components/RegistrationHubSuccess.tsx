import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { useTranslation } from "@/i18n/LocaleProvider";
import type { RegistrationCategoryConfig } from "@/lib/registration/categories";

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}

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
        <CheckCircleIcon className="h-12 w-12 shrink-0 text-success-500" />

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
