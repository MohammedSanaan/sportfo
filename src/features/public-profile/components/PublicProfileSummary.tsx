import { SectionCard } from "@/components/ui/SectionCard";
import { DetailField } from "@/features/athlete-profile/components/DetailField";
import type { PublicAthleteProfile } from "@/lib/athlete/public-profile";

interface PublicProfileSummaryProps {
  profile: PublicAthleteProfile;
}

// Deliberately narrow: only the professional-background fields from the
// public RPC (nationality, school, club, coach) -- never mobile_number,
// email, date_of_birth, or gender, none of which the public RPC even
// returns (see get_public_athlete_profile in
// supabase/migrations/20260820100100_athlete_public_profiles_rls.sql).
export function PublicProfileSummary({ profile }: PublicProfileSummaryProps) {
  return (
    <SectionCard title="Professional Background">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField label="Nationality" value={profile.nationality ?? ""} />
        <DetailField label="School / College" value={profile.school_college ?? ""} />
        <DetailField label="Club / Academy" value={profile.club_academy ?? ""} />
        <DetailField label="Coach / Mentor" value={profile.coach_mentor ?? ""} />
      </div>
    </SectionCard>
  );
}
