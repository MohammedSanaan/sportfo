import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardWelcome } from "./DashboardWelcome";
import { MetricCardsRow } from "./MetricCardsRow";
import { OpportunitiesSection } from "./OpportunitiesSection";
import { PlatformStatsStrip } from "./PlatformStatsStrip";
import { MyStatsCard } from "./MyStatsCard";
import { TopCoachesCard } from "./TopCoachesCard";
import { RecommendedAcademiesCard } from "./RecommendedAcademiesCard";
import { SKILL_LEVELS, getOptionLabel } from "@/lib/athlete-options";
import type { AthleteDashboardData } from "../types";
import type { Locale } from "@/i18n/config";

interface AthleteDashboardProps {
  data: AthleteDashboardData;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: Locale;
}

// The full authenticated Athlete Dashboard -- composes every section from
// data resolved once by getAthleteDashboardData (see ../data/), no
// component below this queries Supabase itself. Desktop: 3 columns (nav /
// main / info rail) at xl+, collapsing to nav+main with the info rail
// moved below at lg, and a single stacked column (nav replaced by the
// mobile drawer in DashboardHeader) below that.
export function AthleteDashboard({ data, t, locale }: AthleteDashboardProps) {
  const skillLevelLabel = data.identity.skillLevel
    ? getOptionLabel(SKILL_LEVELS, data.identity.skillLevel)
    : null;
  const roleLine = skillLevelLabel
    ? `${t("dashboard.header.roleAthlete")} · ${skillLevelLabel.toUpperCase()}`
    : t("dashboard.header.roleAthlete");

  return (
    <div className="min-h-screen bg-[#05080f] text-[#e8ecf8]" style={{
      backgroundImage:
        "radial-gradient(1200px 600px at 12% -5%, #16215a 0%, rgba(6,10,24,0) 60%), radial-gradient(900px 500px at 95% 8%, #2a1146 0%, rgba(6,10,24,0) 55%)",
    }}>
      <DashboardHeader identity={data.identity} roleLine={roleLine} t={t} locale={locale} />

      <div className="grid grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6 lg:px-8 xl:grid-cols-[248px_minmax(0,1fr)_336px]">
        <DashboardSidebar profileStrength={data.profileStrength} t={t} />

        <main className="flex min-w-0 flex-col gap-[22px]">
          <DashboardWelcome
            fullName={data.identity.fullName}
            profile={data.profile}
            profileStrength={data.profileStrength}
            t={t}
          />
          <MetricCardsRow t={t} />
          <OpportunitiesSection t={t} />
          {data.platformCounts && <PlatformStatsStrip counts={data.platformCounts} t={t} />}
        </main>

        <aside className="flex flex-col gap-[18px] lg:col-span-2 xl:col-span-1 xl:sticky xl:top-24">
          <MyStatsCard
            profileStrengthPercentage={data.profileStrength.percentage}
            achievementsCount={data.stats.achievementsCount}
            verifiedCount={data.stats.verifiedCount}
            t={t}
          />
          <TopCoachesCard t={t} />
          <RecommendedAcademiesCard t={t} />
        </aside>
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-5 border-t border-white/[0.07] px-4 py-5 text-sm text-[#8b96b8] sm:px-8">
        <span className="font-mono text-[11px] tracking-[0.12em]">
          {t("dashboard.footer.copyright")}
        </span>
        {/* Matches the public site's own Footer.tsx treatment for these
            two -- disabled "coming soon" text, never a link to a page
            that doesn't exist yet. */}
        <div className="ml-auto flex flex-wrap gap-5">
          <span aria-disabled title={t("dashboard.footer.comingSoon")} className="text-[#8b96b8]/60">
            {t("dashboard.footer.helpCenter")}
          </span>
          <span aria-disabled title={t("dashboard.footer.comingSoon")} className="text-[#8b96b8]/60">
            {t("dashboard.footer.privacyPolicy")}
          </span>
        </div>
      </footer>
    </div>
  );
}
