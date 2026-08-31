import { EmploymentIcon } from "@/components/ui/RegistrationIcons";
import { getOptionLabel, EMPLOYMENT_TYPES, YEARS_EXPERIENCE } from "@/lib/athlete-options";
import type { AthleteProfileRow } from "@/types/database";
import { DarkSectionCard } from "./DarkSectionCard";
import { AthleteInfoGrid } from "./AthleteInfoGrid";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface AthleteEmploymentSectionProps {
  profile: AthleteProfileRow;
  locale: Locale;
}

// Only ever rendered by the caller (page.tsx) when at least one of these
// four fields is actually filled in -- never shown as an empty section, per
// the task's "do not blindly dump every DB field" instruction.
export function AthleteEmploymentSection({ profile, locale }: AthleteEmploymentSectionProps) {
  const t = (key: string) => translate(locale, key);

  const employmentTypeLabel =
    translateOptions(t, "options.employmentType", EMPLOYMENT_TYPES).find(
      (o) => o.value === profile.employment_type,
    )?.label ?? getOptionLabel(EMPLOYMENT_TYPES, profile.employment_type);
  const yearsExperienceLabel =
    translateOptions(t, "options.yearsExperience", YEARS_EXPERIENCE).find(
      (o) => o.value === profile.years_experience,
    )?.label ?? getOptionLabel(YEARS_EXPERIENCE, profile.years_experience);

  const items = [
    { label: t("register.employment.employmentType"), value: profile.employment_type ? employmentTypeLabel : "" },
    { label: t("register.employment.organization"), value: profile.organization ?? "" },
    { label: t("register.employment.jobTitle"), value: profile.job_title ?? "" },
    { label: t("register.employment.yearsExperience"), value: profile.years_experience ? yearsExperienceLabel : "" },
  ];

  return (
    <DarkSectionCard title={t("register.employment.title")} icon={<EmploymentIcon />}>
      <AthleteInfoGrid items={items} />
    </DarkSectionCard>
  );
}
