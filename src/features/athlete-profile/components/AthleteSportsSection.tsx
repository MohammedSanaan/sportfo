import { SectionCard } from "@/components/ui/SectionCard";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import type { AthleteSportRow } from "@/types/database";
import { DetailField } from "./DetailField";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface AthleteSportsSectionProps {
  sport: AthleteSportRow | null;
  locale: Locale;
}

export function AthleteSportsSection({ sport, locale }: AthleteSportsSectionProps) {
  const t = (key: string) => translate(locale, key);

  if (!sport) {
    return (
      <SectionCard title={t("profile.sportsInfo.title")}>
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          {t("profile.sportsInfo.empty")}
        </p>
      </SectionCard>
    );
  }

  const skillLabel = translateOptions(t, "options.skillLevel", SKILL_LEVELS).find(
    (o) => o.value === sport.skill_level,
  )?.label ?? getOptionLabel(SKILL_LEVELS, sport.skill_level);

  return (
    <SectionCard title={t("profile.sportsInfo.title")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField
          label={t("detailFields.primarySport")}
          value={getOptionLabel(PRIMARY_SPORTS, sport.primary_sport)}
        />
        <DetailField label={t("detailFields.skillLevel")} value={skillLabel} />
        <DetailField
          label={t("detailFields.discipline")}
          value={sport.sport_discipline ?? ""}
        />
        <DetailField label={t("detailFields.position")} value={sport.position_role ?? ""} />
      </div>
    </SectionCard>
  );
}
