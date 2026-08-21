import { SectionCard } from "@/components/ui/SectionCard";
import { AchievementCard } from "@/components/ui/AchievementCard";
import type { AthleteAchievementRow } from "@/types/database";
import { ViewCertificateButton } from "./ViewCertificateButton";

interface AthleteAchievementsSectionProps {
  achievements: AthleteAchievementRow[];
}

export function AthleteAchievementsSection({
  achievements,
}: AthleteAchievementsSectionProps) {
  return (
    <SectionCard
      title="Achievements & Certificates"
      description="Medals, awards, and certifications this athlete has earned."
    >
      {achievements.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          No achievements added yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              achievementType={achievement.achievement_type}
              issuingOrganization={achievement.issuing_organization}
              achievementDate={achievement.achievement_date}
              description={achievement.description}
              documentAction={
                achievement.document_path ? (
                  <ViewCertificateButton achievementId={achievement.id} />
                ) : (
                  <span className="text-xs text-ink-400">No document attached</span>
                )
              }
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
