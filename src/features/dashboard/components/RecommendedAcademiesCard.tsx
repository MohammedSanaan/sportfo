interface RecommendedAcademiesCardProps {
  t: (key: string) => string;
}

// Same reasoning as TopCoachesCard -- no public academy-discovery backend
// exists yet, so this is an honest "coming soon" state rather than the
// reference design's hardcoded ProFit Sports Academy / Star Kick Soccer
// School / Apex Athletics Center.
export function RecommendedAcademiesCard({ t }: RecommendedAcademiesCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
      <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
        {t("dashboard.recommendedAcademies.title")}
      </div>
      <p className="px-[18px] py-6 text-sm text-[#8b96b8]">{t("dashboard.recommendedAcademies.comingSoon")}</p>
    </div>
  );
}
