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
      <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
        <div className="border-b border-border-default px-[18px] py-3.5 text-base font-bold text-ink-900">
          {t("dashboard.recommendedAcademies.title")}
        </div>
        <ul className="flex flex-col divide-y divide-border-default">
          {demo.map((academy) => (
            <li key={academy.id} className="flex items-center gap-3 px-[18px] py-3.5">
              <span aria-hidden className="h-9 w-9 shrink-0 rounded-lg bg-green-50" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink-900">{academy.name}</p>
                <p className="truncate text-xs text-ink-500">{academy.meta}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="px-[18px] py-3.5">
          <DemoOnlyButton
            label={demoCtaLabel}
            demoOnlyLabel={t("dashboard.demo.onlyLabel")}
            className="text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-white">
      <div className="border-b border-border-default px-[18px] py-3.5 text-base font-bold text-ink-900">
        {t("dashboard.recommendedAcademies.title")}
      </div>
      <p className="px-[18px] py-6 text-sm text-ink-500">{t("dashboard.recommendedAcademies.comingSoon")}</p>
    </div>
  );
}
