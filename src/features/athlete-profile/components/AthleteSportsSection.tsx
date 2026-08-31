import { SportsIcon } from "@/components/ui/RegistrationIcons";
import {
  getOptionLabel,
  PRIMARY_SPORTS,
  SKILL_LEVELS,
  COMPETITION_LEVELS,
  SUPPORT_NEEDED,
} from "@/lib/athlete-options";
import type { AthleteProfileRow, AthleteSportRow } from "@/types/database";
import { DarkSectionCard } from "./DarkSectionCard";
import { AthleteInfoGrid } from "./AthleteInfoGrid";
import { translate } from "@/i18n/dictionary";
import { translateOptions } from "@/lib/i18n-options";
import { deriveDisciplinePosition } from "@/lib/athlete/discipline-position";
import type { Locale } from "@/i18n/config";

interface AthleteSportsSectionProps {
  sport: AthleteSportRow | null;
  // Club/Academy and Coach/Mentor Name live on athlete_profiles (moved
  // here visually from Personal Information, same underlying columns --
  // see the registration form's SportsInformationSection), so this
  // section needs the profile row too, not just the sport row.
  profile: AthleteProfileRow;
  locale: Locale;
}

export function AthleteSportsSection({ sport, profile, locale }: AthleteSportsSectionProps) {
  const t = (key: string) => translate(locale, key);

  const clubCoachItems = [
    { label: t("detailFields.clubAcademy"), value: profile.club_academy ?? "" },
    { label: t("detailFields.coachMentor"), value: profile.coach_mentor ?? "" },
  ];
  const hasClubOrCoach = Boolean(profile.club_academy || profile.coach_mentor);

  if (!sport) {
    return (
      <DarkSectionCard title={t("profile.sportsInfo.title")} icon={<SportsIcon />}>
        <p className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-[#8b96b8]">
          {t("profile.sportsInfo.empty")}
        </p>
        {hasClubOrCoach && <AthleteInfoGrid items={clubCoachItems} />}
      </DarkSectionCard>
    );
  }

  const skillLabel = translateOptions(t, "options.skillLevel", SKILL_LEVELS).find(
    (o) => o.value === sport.skill_level,
  )?.label ?? getOptionLabel(SKILL_LEVELS, sport.skill_level);

  // Same "other resolves to the real specified text" pattern as
  // AchievementCard's achievementTypeLabel -- never just shows the generic
  // "Other" label when the athlete actually specified a real value.
  const competitionLevelLabel =
    sport.competition_level === "other" && sport.competition_level_other
      ? sport.competition_level_other
      : (translateOptions(t, "options.competitionLevel", COMPETITION_LEVELS).find(
          (o) => o.value === sport.competition_level,
        )?.label ?? getOptionLabel(COMPETITION_LEVELS, sport.competition_level));

  const items = [
    { label: t("detailFields.primarySport"), value: getOptionLabel(PRIMARY_SPORTS, sport.primary_sport) },
    { label: t("detailFields.sportCategory"), value: sport.sport_category ?? "" },
    // Single merged row -- never the old separate discipline/position rows
    // side by side (see task spec). deriveDisciplinePosition safely
    // combines a legacy record's two distinct values rather than dropping
    // one of them.
    { label: t("detailFields.disciplinePosition"), value: deriveDisciplinePosition(sport) },
    { label: t("detailFields.skillLevel"), value: skillLabel },
    { label: t("detailFields.competitionLevel"), value: sport.competition_level ? competitionLevelLabel : "" },
    ...clubCoachItems,
  ];

  return (
    <DarkSectionCard title={t("profile.sportsInfo.title")} icon={<SportsIcon />}>
      <AthleteInfoGrid items={items} />

      {sport.secondary_sports && sport.secondary_sports.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-medium tracking-wide text-[#8b96b8] uppercase">
            {t("detailFields.secondarySports")}
          </span>
          <div className="flex flex-wrap gap-2">
            {sport.secondary_sports.map((secondarySport) => (
              <span
                key={secondarySport}
                className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-[#cddaff]"
              >
                {secondarySport}
              </span>
            ))}
          </div>
        </div>
      )}

      {sport.support_needed && sport.support_needed.length > 0 && (
        <div>
          <span className="mb-2 block text-xs font-medium tracking-wide text-[#8b96b8] uppercase">
            {t("detailFields.supportNeeded")}
          </span>
          <div className="flex flex-wrap gap-2">
            {sport.support_needed.map((need) => {
              const label =
                need === "Other" && sport.support_needed_other
                  ? sport.support_needed_other
                  : (translateOptions(t, "options.supportNeeded", SUPPORT_NEEDED).find((o) => o.value === need)
                      ?.label ?? need);
              return (
                <span
                  key={need}
                  className="rounded-full border border-[#4d7cff]/30 bg-[#4d7cff]/10 px-3 py-1 text-xs font-medium text-[#a9c1ff]"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </DarkSectionCard>
  );
}
