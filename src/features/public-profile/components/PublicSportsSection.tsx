import { SectionCard } from "@/components/ui/SectionCard";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import { DetailField } from "@/features/athlete-profile/components/DetailField";
import { deriveDisciplinePosition } from "@/lib/athlete/discipline-position";
import type { PublicAthleteProfile } from "@/lib/athlete/public-profile";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface PublicSportsSectionProps {
  profile: PublicAthleteProfile;
  locale: Locale;
}

export function PublicSportsSection({ profile, locale }: PublicSportsSectionProps) {
  const t = (key: string) => translate(locale, key);
  const hasSportsInfo =
    profile.primary_sport || profile.skill_level || profile.sport_discipline || profile.position_role;

  if (!hasSportsInfo) {
    return (
      <SectionCard title={t("publicProfile.sportsInfo.title")}>
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          {t("publicProfile.sportsInfo.empty")}
        </p>
      </SectionCard>
    );
  }

  const skillLabel = translateOptions(t, "options.skillLevel", SKILL_LEVELS).find(
    (o) => o.value === profile.skill_level,
  )?.label ?? getOptionLabel(SKILL_LEVELS, profile.skill_level);

  return (
    <SectionCard title={t("publicProfile.sportsInfo.title")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField
          label={t("detailFields.primarySport")}
          value={getOptionLabel(PRIMARY_SPORTS, profile.primary_sport)}
        />
        <DetailField label={t("detailFields.sportCategory")} value={profile.sport_category ?? ""} />
        <DetailField label={t("detailFields.skillLevel")} value={skillLabel} />
        {/* One merged field, never the old separate discipline/position
            rows -- see task spec. */}
        <DetailField
          label={t("detailFields.disciplinePosition")}
          value={deriveDisciplinePosition(profile)}
        />
      </div>

      {profile.secondary_sports && profile.secondary_sports.length > 0 && (
        <div className="mt-5">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-400">
            {t("detailFields.secondarySports")}
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.secondary_sports.map((sport) => (
              <span
                key={sport}
                className="rounded-full border border-border-default bg-surface-muted px-3 py-1 text-xs font-medium text-ink-700"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
