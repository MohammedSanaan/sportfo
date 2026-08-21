import { SectionCard } from "@/components/ui/SectionCard";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import { DetailField } from "@/features/athlete-profile/components/DetailField";
import type { PublicAthleteProfile } from "@/lib/athlete/public-profile";

interface PublicSportsSectionProps {
  profile: PublicAthleteProfile;
}

export function PublicSportsSection({ profile }: PublicSportsSectionProps) {
  const hasSportsInfo =
    profile.primary_sport || profile.skill_level || profile.sport_discipline || profile.position_role;

  if (!hasSportsInfo) {
    return (
      <SectionCard title="Sports Information">
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          No sports information added yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Sports Information">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailField
          label="Primary Sport"
          value={getOptionLabel(PRIMARY_SPORTS, profile.primary_sport)}
        />
        <DetailField
          label="Skill Level"
          value={getOptionLabel(SKILL_LEVELS, profile.skill_level)}
        />
        <DetailField
          label="Sport Discipline / Sub-category"
          value={profile.sport_discipline ?? ""}
        />
        <DetailField label="Position / Role" value={profile.position_role ?? ""} />
      </div>
    </SectionCard>
  );
}
