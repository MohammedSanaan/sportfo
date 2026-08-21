import { SectionCard } from "@/components/ui/SectionCard";
import { AchievementCard } from "@/components/ui/AchievementCard";
import type { PublicAthleteAchievement } from "@/lib/athlete/public-profile";

interface PublicAchievementsSectionProps {
  achievements: PublicAthleteAchievement[];
}

// No document actions here by design -- has_document only ever renders a
// static "Certificate available" label. The public RPC never returns
// document_path, so there is nothing to sign a URL for even if this
// component wanted to; the private certificate flow (ViewCertificateButton,
// getAchievementDocumentSignedUrl) stays exclusively on the owner's
// /athlete/profile page.
export function PublicAchievementsSection({ achievements }: PublicAchievementsSectionProps) {
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
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={`${achievement.title ?? "achievement"}-${index}`}
              title={achievement.title}
              achievementType={achievement.achievement_type}
              issuingOrganization={achievement.issuing_organization}
              achievementDate={achievement.achievement_date}
              description={achievement.description}
              documentAction={
                achievement.has_document ? (
                  <span className="text-xs font-medium text-brand-700">
                    Certificate available
                  </span>
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
