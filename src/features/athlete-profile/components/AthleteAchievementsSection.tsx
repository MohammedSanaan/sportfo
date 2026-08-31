import Link from "next/link";
import { AchievementIcon } from "@/components/ui/RegistrationIcons";
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

  const addAchievementCta = (
    <Link
      href="/athlete/register"
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#4d7cff] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6a92ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430]"
    >
      {t("register.achievements.addAchievement")}
    </Link>
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1430] p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4d7cff]/15 text-[#7ea3ff]">
            <AchievementIcon />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#e8ecf8] sm:text-lg">{t("profile.achievements.title")}</h2>
            <p className="mt-0.5 text-sm text-[#8b96b8]">{t("profile.achievements.description")}</p>
          </div>
        </div>
        {achievements.length > 0 && addAchievementCta}
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/15 px-6 py-12 text-center">
          <p className="text-sm text-[#8b96b8]">{t("profile.achievements.empty")}</p>
          {addAchievementCta}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              variant="dark"
              title={achievement.title}
              achievementType={achievement.achievement_type}
              achievementTypeOther={achievement.achievement_type_other}
              issuingOrganization={achievement.issuing_organization}
              issuingOrganizationOther={achievement.issuing_organization_other}
              achievementDate={achievement.achievement_date}
              description={achievement.description}
              certificateLevel={achievement.certificate_level}
              medalType={achievement.medal_type}
              verificationStatus={achievement.verification_status}
              showAllVerificationStatuses
              locale={locale}
              documentAction={
                achievement.document_path ? (
                  <ViewCertificateButton achievementId={achievement.id} />
                ) : (
                  <span className="text-xs text-[#5c6a99]">{t("profile.achievements.noDocument")}</span>
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
