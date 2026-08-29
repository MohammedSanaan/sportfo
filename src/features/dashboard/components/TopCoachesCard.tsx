import { DemoOnlyButton } from "./DemoOnlyButton";
import type { DemoCoach } from "../data/demo-dashboard";

interface TopCoachesCardProps {
  t: (key: string) => string;
  /** DEV/DEMO ONLY -- see demo-dashboard.ts. Undefined outside demo mode. */
  demo?: DemoCoach[];
}

// SportFo has academy_coach_profiles registrations (RLS: owner-only
// SELECT), but no public coach-discovery RPC exists yet -- there is no
// safe way to list other users' coach profiles without building that
// backend first (out of scope for this phase). Renders an honest
// "coming soon" state -- UNLESS `demo` is provided (only in dev/demo
// mode), in which case the reference design's sample coach list is shown,
// each with a non-persisting DemoOnlyButton "Follow" (no real follow
// backend exists, so clicking never writes anything).
export function TopCoachesCard({ t, demo }: TopCoachesCardProps) {
  if (demo) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
        <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
          {t("dashboard.topCoaches.title")}
        </div>
        <ul className="flex flex-col divide-y divide-white/[0.08]">
          {demo.map((coach) => (
            <li key={coach.id} className="flex items-center gap-3 px-[18px] py-3.5">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2a3a7e] to-[#141b3f] text-xs font-bold text-[#a9c1ff]"
              >
                {coach.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#e8ecf8]">{coach.name}</p>
                <p className="truncate text-xs text-[#8b96b8]">{coach.subtitle}</p>
              </div>
              <DemoOnlyButton
                label={t("dashboard.topCoaches.follow")}
                demoOnlyLabel={t("dashboard.demo.onlyLabel")}
                className="h-8 shrink-0 rounded-lg border border-white/15 px-3 text-xs font-semibold text-[#cddaff] transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
      <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
        {t("dashboard.topCoaches.title")}
      </div>
      <p className="px-[18px] py-6 text-sm text-[#8b96b8]">{t("dashboard.topCoaches.comingSoon")}</p>
    </div>
  );
}
