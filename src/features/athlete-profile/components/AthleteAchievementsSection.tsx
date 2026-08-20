import { SectionCard } from "@/components/ui/SectionCard";
import { ACHIEVEMENT_TYPES, getOptionLabel } from "@/lib/athlete-options";
import { formatDisplayDate } from "@/lib/format";
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
            <div
              key={achievement.id}
              className="rounded-lg border border-border-default bg-surface-muted p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-ink-900">
                    {achievement.title || "Untitled achievement"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                    {achievement.achievement_type && (
                      <span>{getOptionLabel(ACHIEVEMENT_TYPES, achievement.achievement_type)}</span>
                    )}
                    {achievement.issuing_organization && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{achievement.issuing_organization}</span>
                      </>
                    )}
                    {achievement.achievement_date && (
                      <>
                        <span aria-hidden>·</span>
                        <span>{formatDisplayDate(achievement.achievement_date)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {achievement.document_path ? (
                    <ViewCertificateButton achievementId={achievement.id} />
                  ) : (
                    <span className="text-xs text-ink-400">No document attached</span>
                  )}
                </div>
              </div>

              {achievement.description && (
                <p className="mt-3 text-sm text-ink-600">{achievement.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
