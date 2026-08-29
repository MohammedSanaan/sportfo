import { DemoOnlyButton } from "./DemoOnlyButton";
import type { DemoAcademy } from "../data/demo-dashboard";

interface RecommendedAcademiesCardProps {
  t: (key: string) => string;
  /** DEV/DEMO ONLY -- see demo-dashboard.ts. Undefined outside demo mode. */
  demo?: DemoAcademy[];
  demoCtaLabel?: string;
}

// Same reasoning as TopCoachesCard -- no public academy-discovery backend
// exists yet, so this is an honest "coming soon" state -- UNLESS `demo` is
// provided (only in dev/demo mode), in which case the reference design's
// sample academy list (ProFit Sports Academy / Star Kick Soccer School /
// Apex Athletics Center) is shown, with a non-persisting "View all
// academies" DemoOnlyButton rather than a link to a discovery page that
// doesn't exist yet.
export function RecommendedAcademiesCard({ t, demo, demoCtaLabel }: RecommendedAcademiesCardProps) {
  if (demo && demoCtaLabel) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
        <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
          {t("dashboard.recommendedAcademies.title")}
        </div>
        <ul className="flex flex-col divide-y divide-white/[0.08]">
          {demo.map((academy) => (
            <li key={academy.id} className="flex items-center gap-3 px-[18px] py-3.5">
              <span
                aria-hidden
                className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#1c4d3a] to-[#0d1430]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#e8ecf8]">{academy.name}</p>
                <p className="truncate text-xs text-[#8b96b8]">{academy.meta}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-[18px] py-3.5">
          <DemoOnlyButton
            label={demoCtaLabel}
            demoOnlyLabel={t("dashboard.demo.onlyLabel")}
            className="text-sm font-semibold text-[#7ea3ff] transition-colors hover:text-[#a9c1ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff] rounded"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
      <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
        {t("dashboard.recommendedAcademies.title")}
      </div>
      <p className="px-[18px] py-6 text-sm text-[#8b96b8]">{t("dashboard.recommendedAcademies.comingSoon")}</p>
    </div>
  );
}
