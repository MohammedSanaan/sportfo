import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  ACHIEVEMENT_TYPES,
  CERTIFICATE_LEVELS,
  ISSUING_ORGANIZATIONS,
  MEDAL_TYPES,
  getOptionLabel,
} from "@/lib/athlete-options";
import { formatDisplayDate } from "@/lib/format";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface AchievementCardProps {
  title: string | null;
  achievementType: string | null;
  // Free-text detail shown instead of the generic "Other" label when
  // achievementType === "other" -- the real specified type, never lost.
  achievementTypeOther?: string | null;
  issuingOrganization: string | null;
  // Same "other" resolution as achievementTypeOther, for issuingOrganization.
  issuingOrganizationOther?: string | null;
  achievementDate: string | null;
  description: string | null;
  locale: Locale;
  certificateLevel?: string | null;
  // Set only when achievementType === "medal" (see Achievements &
  // Certificates in the registration form) -- ignored otherwise.
  medalType?: string | null;
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

const MEDAL_ACCENT: Record<string, { dot: string; text: string }> = {
  gold: { dot: "bg-amber-500", text: "text-amber-700" },
  silver: { dot: "bg-slate-400", text: "text-slate-600" },
  bronze: { dot: "bg-orange-700", text: "text-orange-800" },
};

export function AchievementCard({
  title,
  achievementType,
  achievementTypeOther,
  issuingOrganization,
  issuingOrganizationOther,
  achievementDate,
  description,
  locale,
  certificateLevel,
  medalType,
  verificationStatus,
  showAllVerificationStatuses = false,
  documentAction,
}: AchievementCardProps) {
  const t = (key: string) => translate(locale, key);
  // "other" resolves to the real specified text rather than the generic
  // "Other" option label -- falls back to the plain option label if the
  // specify text is somehow missing, never to a blank display.
  const achievementTypeLabel =
    achievementType &&
    (achievementType === "other" && achievementTypeOther
      ? achievementTypeOther
      : (translateOptions(t, "options.achievementType", ACHIEVEMENT_TYPES).find(
          (o) => o.value === achievementType,
        )?.label ?? getOptionLabel(ACHIEVEMENT_TYPES, achievementType)));
  const issuingOrganizationLabel =
    issuingOrganization &&
    (issuingOrganization === "other" && issuingOrganizationOther
      ? issuingOrganizationOther
      : (translateOptions(t, "options.issuingOrganization", ISSUING_ORGANIZATIONS).find(
          (o) => o.value === issuingOrganization,
        )?.label ?? getOptionLabel(ISSUING_ORGANIZATIONS, issuingOrganization)));
  const certificateLevelLabel = certificateLevel && getOptionLabel(CERTIFICATE_LEVELS, certificateLevel);
  const medalTypeLabel =
    achievementType === "medal" && medalType
      ? (translateOptions(t, "options.medalType", MEDAL_TYPES).find((o) => o.value === medalType)?.label ??
        getOptionLabel(MEDAL_TYPES, medalType))
      : null;
  const medalAccent = medalType ? MEDAL_ACCENT[medalType] : undefined;

  const showVerificationBadge =
    verificationStatus && (showAllVerificationStatuses || verificationStatus === "verified");

  return (
    <div className="rounded-xl border border-border-default bg-surface-muted p-5 transition-colors hover:border-brand-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {medalAccent && (
              <span aria-hidden className={cn("h-2.5 w-2.5 shrink-0 rounded-full", medalAccent.dot)} />
            )}
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
            {issuingOrganizationLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{issuingOrganizationLabel}</span>
              </>
            )}
            {achievementDate && (
              <>
                <span aria-hidden>·</span>
                <span>{formatDisplayDate(achievementDate)}</span>
              </>
            )}
          </div>
          {medalTypeLabel && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                {t("register.achievements.medalType")}
              </span>
              <span className={cn("font-bold", medalAccent?.text ?? "text-ink-900")}>{medalTypeLabel}</span>
            </div>
          )}
        </div>

        {documentAction && <div className="shrink-0">{documentAction}</div>}
      </div>

      {description && <p className="mt-3 text-sm text-ink-600">{description}</p>}
    </div>
  );
}
