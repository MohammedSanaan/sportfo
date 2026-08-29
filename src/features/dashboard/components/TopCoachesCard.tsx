interface TopCoachesCardProps {
  t: (key: string) => string;
}

// SportFo has academy_coach_profiles registrations (RLS: owner-only
// SELECT), but no public coach-discovery RPC exists yet -- there is no
// safe way to list other users' coach profiles without building that
// backend first (out of scope for this phase). Renders an honest
// "coming soon" state rather than the reference design's hardcoded
// Rahul Sharma / Anita Mehra / Dev Nair.
export function TopCoachesCard({ t }: TopCoachesCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
      <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
        {t("dashboard.topCoaches.title")}
      </div>
      <p className="px-[18px] py-6 text-sm text-[#8b96b8]">{t("dashboard.topCoaches.comingSoon")}</p>
    </div>
  );
}
