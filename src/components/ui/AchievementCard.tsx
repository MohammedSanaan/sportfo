import type { ReactNode } from "react";
import { ACHIEVEMENT_TYPES, getOptionLabel } from "@/lib/athlete-options";
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
  // Owner and public views need different right-side content (a real
  // ViewCertificateButton vs. a static "Certificate available" label) --
  // rather than this component knowing about ownership, the caller
  // decides what goes here. See AthleteAchievementsSection and
  // PublicAchievementsSection.
  documentAction?: ReactNode;
}

export function AchievementCard({
  title,
  achievementType,
  issuingOrganization,
  achievementDate,
  description,
  locale,
  documentAction,
}: AchievementCardProps) {
  const t = (key: string) => translate(locale, key);
  const achievementTypeLabel =
    achievementType &&
    (translateOptions(t, "options.achievementType", ACHIEVEMENT_TYPES).find(
      (o) => o.value === achievementType,
    )?.label ?? getOptionLabel(ACHIEVEMENT_TYPES, achievementType));

  return (
    <div className="rounded-xl border border-border-default bg-surface-muted p-5 transition-colors hover:border-brand-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-ink-900">
            {title || t("profile.achievements.untitled")}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            {achievementTypeLabel && <span>{achievementTypeLabel}</span>}
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
