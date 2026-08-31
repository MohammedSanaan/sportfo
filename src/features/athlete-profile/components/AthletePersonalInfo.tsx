import { PersonalDetailsIcon } from "@/components/ui/RegistrationIcons";
import { getOptionLabel, GENDER_OPTIONS } from "@/lib/athlete-options";
import { formatDisplayDate } from "@/lib/format";
import type { AthleteProfileRow } from "@/types/database";
import { DarkSectionCard } from "./DarkSectionCard";
import { AthleteInfoGrid } from "./AthleteInfoGrid";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import { isLocale, LOCALE_LABELS, type Locale } from "@/i18n/config";

interface AthletePersonalInfoProps {
  profile: AthleteProfileRow;
  locale: Locale;
}

// Owner-only (never rendered on /a/[slug]) -- Aadhaar/Govt ID and Emergency
// Contact are deliberately never displayed here at all, same as before this
// redesign; there is no "private-fields toggle" to build since the profile
// row is never fetched or shown to anyone but its own owner in the first
// place (RLS-scoped query in page.tsx).
export function AthletePersonalInfo({ profile, locale }: AthletePersonalInfoProps) {
  const t = (key: string) => translate(locale, key);
  const genderLabel = translateOptions(t, "options.gender", GENDER_OPTIONS).find(
    (o) => o.value === profile.gender,
  )?.label ?? getOptionLabel(GENDER_OPTIONS, profile.gender);

  const items = [
    { label: t("detailFields.fullName"), value: profile.full_name ?? "" },
    { label: t("detailFields.dateOfBirth"), value: formatDisplayDate(profile.date_of_birth) },
    { label: t("detailFields.gender"), value: genderLabel },
    { label: t("detailFields.nationality"), value: profile.nationality ?? "" },
    // "Taluk / City / District, State, Country" -- the updated location
    // model (see the athlete-registration location fields), never the old
    // City-only display.
    { label: t("detailFields.city"), value: profile.city ?? "" },
    { label: t("detailFields.state"), value: profile.state ?? "" },
    { label: t("detailFields.country"), value: profile.country ?? "" },
    { label: t("detailFields.mobileNumber"), value: profile.mobile_number ?? "" },
    { label: t("detailFields.email"), value: profile.email ?? "" },
    {
      label: t("detailFields.preferredLanguage"),
      value: isLocale(profile.preferred_language) ? LOCALE_LABELS[profile.preferred_language] : "",
    },
    { label: t("detailFields.schoolCollege"), value: profile.school_college ?? "" },
    { label: t("detailFields.clubAcademy"), value: profile.club_academy ?? "" },
    { label: t("detailFields.coachMentor"), value: profile.coach_mentor ?? "" },
  ];

  return (
    <DarkSectionCard title={t("profile.personalInfo.title")} icon={<PersonalDetailsIcon />}>
      <AthleteInfoGrid items={items} />
    </DarkSectionCard>
  );
}
