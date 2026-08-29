import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ACHIEVEMENT_TYPES, CERTIFICATE_LEVELS, getOptionLabel } from "@/lib/athlete-options";
import { formatDisplayDate } from "@/lib/format";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface AchievementCardProps {
  title: string | null;
  achievementType: string | null;
  issuingOrganization: string | null;
  achievementDate: string | null;
  description: string | null;
  locale: Locale;
  certificateLevel?: string | null;
  verificationStatus?: string | null;
  // The owner's own profile always sees pending/verified/rejected -- the
  // public profile only ever shows a "Verified" badge (a trust signal),
  // never surfacing "pending" or "rejected" to outside visitors. See
  // AthleteAchievementsSection (true) vs. PublicAchievementsSection
  // (omitted/false).
  showAllVerificationStatuses?: boolean;
  // Owner and public views need different right-side content (a real
  // ViewCertificateButton vs. a static "Certificate available" label) --
  // rather than this component knowing about ownership, the caller
  // decides what goes here. See AthleteAchievementsSection and
  // PublicAchievementsSection.
  documentAction?: ReactNode;
}

const VERIFICATION_BADGE_STYLES: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  verified: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

export function AchievementCard({
  title,
  achievementType,
  issuingOrganization,
  achievementDate,
  description,
  locale,
  certificateLevel,
  verificationStatus,
  showAllVerificationStatuses = false,
  documentAction,
}: AchievementCardProps) {
  const t = (key: string) => translate(locale, key);
  const achievementTypeLabel =
    achievementType &&
    (translateOptions(t, "options.achievementType", ACHIEVEMENT_TYPES).find(
      (o) => o.value === achievementType,
    )?.label ?? getOptionLabel(ACHIEVEMENT_TYPES, achievementType));
  const certificateLevelLabel = certificateLevel && getOptionLabel(CERTIFICATE_LEVELS, certificateLevel);

  const showVerificationBadge =
    verificationStatus && (showAllVerificationStatuses || verificationStatus === "verified");

  return (
    <div className="rounded-xl border border-border-default bg-surface-muted p-5 transition-colors hover:border-brand-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink-900">
              {title || t("profile.achievements.untitled")}
            </h3>
            {showVerificationBadge && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  VERIFICATION_BADGE_STYLES[verificationStatus] ?? VERIFICATION_BADGE_STYLES.pending,
                )}
              >
                {t(`register.achievements.verification.${verificationStatus}`)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            {achievementTypeLabel && <span>{achievementTypeLabel}</span>}
            {certificateLevelLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{certificateLevelLabel}</span>
              </>
            )}
            {issuingOrganization && (
              <>
                <span aria-hidden>·</span>
                <span>{issuingOrganization}</span>
              </>
            )}
            {achievementDate && (
              <>
                <span aria-hidden>·</span>
                <span>{formatDisplayDate(achievementDate)}</span>
              </>
            )}
          </div>
        </div>

        {documentAction && <div className="shrink-0">{documentAction}</div>}
      </div>

      {description && <p className="mt-3 text-sm text-ink-600">{description}</p>}
    </div>
  );
}
