import { SectionCard } from "@/components/ui/SectionCard";
import type { AthleteSportRow } from "@/types/database";
import { skillLevelLabel, sportLabel } from "@/lib/athlete/profile-display";
import { InfoGrid } from "./InfoGrid";

interface SportsInformationSectionProps {
  sport: AthleteSportRow | null;
}

export function SportsInformationSection({ sport }: SportsInformationSectionProps) {
  return (
    <SectionCard title="Sports Information">
      <InfoGrid
        items={[
          { label: "Primary Sport", value: sportLabel(sport?.primary_sport ?? null) },
          { label: "Sub-category / Discipline", value: sport?.sport_discipline },
          { label: "Position / Role", value: sport?.position_role },
          { label: "Skill Level", value: skillLevelLabel(sport?.skill_level ?? null) },
        ]}
      />
    </SectionCard>
  );
}
