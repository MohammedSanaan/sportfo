import { SectionCard } from "@/components/ui/SectionCard";
import { AchievementCard } from "@/components/ui/AchievementCard";
import type { PublicAthleteAchievement } from "@/lib/athlete/public-profile";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface PublicAchievementsSectionProps {
  achievements: PublicAthleteAchievement[];
  locale: Locale;
}

// No document actions here by design -- has_document only ever renders a
// static "Certificate available" label. The public RPC never returns
// document_path, so there is nothing to sign a URL for even if this
// component wanted to; the private certificate flow (ViewCertificateButton,
// getAchievementDocumentSignedUrl) stays exclusively on the owner's
// /athlete/profile page.
export function PublicAchievementsSection({ achievements, locale }: PublicAchievementsSectionProps) {
  const t = (key: string) => translate(locale, key);

  return (
    <SectionCard
      title={t("publicProfile.achievements.title")}
      description={t("publicProfile.achievements.description")}
    >
      {achievements.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          {t("publicProfile.achievements.empty")}
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
              locale={locale}
              documentAction={
                achievement.has_document ? (
                  <span className="text-xs font-medium text-brand-700">
                    {t("publicProfile.achievements.certificateAvailable")}
                  </span>
                ) : (
                  <span className="text-xs text-ink-400">
                    {t("publicProfile.achievements.noDocument")}
                  </span>
                )
              }
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
