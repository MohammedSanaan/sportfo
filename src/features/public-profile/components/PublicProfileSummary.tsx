import { SectionCard } from "@/components/ui/SectionCard";
import { DetailField } from "@/features/athlete-profile/components/DetailField";
import type { PublicAthleteProfile } from "@/lib/athlete/public-profile";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface PublicProfileSummaryProps {
  profile: PublicAthleteProfile;
  locale: Locale;
}

// Deliberately narrow: only the professional-background fields from the
// public RPC (nationality, school, club, coach) -- never mobile_number,
// email, date_of_birth, or gender, none of which the public RPC even
// returns (see get_public_athlete_profile in
// supabase/migrations/20260820100100_athlete_public_profiles_rls.sql).
export function PublicProfileSummary({ profile, locale }: PublicProfileSummaryProps) {
  const t = (key: string) => translate(locale, key);

  return (
    <SectionCard title={t("publicProfile.overviewTitle")}>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField label={t("detailFields.nationality")} value={profile.nationality ?? ""} />
        <DetailField label={t("detailFields.schoolCollege")} value={profile.school_college ?? ""} />
        <DetailField label={t("detailFields.clubAcademy")} value={profile.club_academy ?? ""} />
        <DetailField label={t("detailFields.coachMentor")} value={profile.coach_mentor ?? ""} />
      </div>
    </SectionCard>
  );
}
