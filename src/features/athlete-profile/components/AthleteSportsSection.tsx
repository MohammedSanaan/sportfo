import { SectionCard } from "@/components/ui/SectionCard";
import { getOptionLabel, PRIMARY_SPORTS, SKILL_LEVELS } from "@/lib/athlete-options";
import type { AthleteSportRow } from "@/types/database";
import { DetailField } from "./DetailField";

interface AthleteSportsSectionProps {
  sport: AthleteSportRow | null;
}

export function AthleteSportsSection({ sport }: AthleteSportsSectionProps) {
  if (!sport) {
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
          value={getOptionLabel(PRIMARY_SPORTS, sport.primary_sport)}
        />
        <DetailField
          label="Skill Level"
          value={getOptionLabel(SKILL_LEVELS, sport.skill_level)}
        />
        <DetailField
          label="Sport Discipline / Sub-category"
          value={sport.sport_discipline ?? ""}
        />
        <DetailField label="Position / Role" value={sport.position_role ?? ""} />
      </div>
    </SectionCard>
  );
}
