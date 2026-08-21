import { SectionCard } from "@/components/ui/SectionCard";
import { getOptionLabel, GENDER_OPTIONS } from "@/lib/athlete-options";
import { formatDisplayDate } from "@/lib/format";
import type { AthleteProfileRow } from "@/types/database";
import { DetailField } from "./DetailField";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import type { Locale } from "@/i18n/config";

interface AthletePersonalInfoProps {
  profile: AthleteProfileRow;
  locale: Locale;
}

export function AthletePersonalInfo({ profile, locale }: AthletePersonalInfoProps) {
  const t = (key: string) => translate(locale, key);
  const genderLabel = translateOptions(t, "options.gender", GENDER_OPTIONS).find(
    (o) => o.value === profile.gender,
  )?.label ?? getOptionLabel(GENDER_OPTIONS, profile.gender);

  return (
    <SectionCard title={t("profile.personalInfo.title")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField label={t("detailFields.fullName")} value={profile.full_name ?? ""} />
        <DetailField
          label={t("detailFields.dateOfBirth")}
          value={formatDisplayDate(profile.date_of_birth)}
        />
        <DetailField label={t("detailFields.gender")} value={genderLabel} />
        <DetailField label={t("detailFields.nationality")} value={profile.nationality ?? ""} />
        <DetailField label={t("detailFields.country")} value={profile.country ?? ""} />
        <DetailField label={t("detailFields.city")} value={profile.city ?? ""} />
        <DetailField label={t("detailFields.mobileNumber")} value={profile.mobile_number ?? ""} />
        <DetailField label={t("detailFields.email")} value={profile.email ?? ""} />
      </div>
    </SectionCard>
  );
}
