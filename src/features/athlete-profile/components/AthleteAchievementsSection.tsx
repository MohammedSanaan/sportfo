import { SectionCard } from "@/components/ui/SectionCard";
import { AchievementCard } from "@/components/ui/AchievementCard";
import type { AthleteAchievementRow } from "@/types/database";
import { ViewCertificateButton } from "./ViewCertificateButton";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface AthleteAchievementsSectionProps {
  achievements: AthleteAchievementRow[];
  locale: Locale;
}

export function AthleteAchievementsSection({
  achievements,
  locale,
}: AthleteAchievementsSectionProps) {
  const t = (key: string) => translate(locale, key);

  return (
    <SectionCard
      title={t("profile.achievements.title")}
      description={t("profile.achievements.description")}
    >
      {achievements.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-6 text-center text-sm text-ink-400">
          {t("profile.achievements.empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              title={achievement.title}
              achievementType={achievement.achievement_type}
              achievementTypeOther={achievement.achievement_type_other}
              issuingOrganization={achievement.issuing_organization}
              issuingOrganizationOther={achievement.issuing_organization_other}
              achievementDate={achievement.achievement_date}
              description={achievement.description}
              certificateLevel={achievement.certificate_level}
              verificationStatus={achievement.verification_status}
              showAllVerificationStatuses
              locale={locale}
              documentAction={
                achievement.document_path ? (
                  <ViewCertificateButton achievementId={achievement.id} />
                ) : (
                  <span className="text-xs text-ink-400">{t("profile.achievements.noDocument")}</span>
                )
              }
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
