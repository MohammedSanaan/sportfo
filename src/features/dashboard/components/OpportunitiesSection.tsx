import Link from "next/link";
import { OpportunityFilters } from "./OpportunityFilters";

interface OpportunitiesSectionProps {
  t: (key: string) => string;
}

// SportFo has no opportunities/trials/sponsorships/camps backend yet (see
// get-athlete-dashboard.ts -- opportunities.available is always false
// today), so this always renders the honest empty state below rather than
// the reference design's hardcoded "Football trials — Mumbai" / "Gold
// level sponsorship" / "Elite sports academy camp" cards. OpportunityCard
// is built and ready for the day real data exists.
export function OpportunitiesSection({ t }: OpportunitiesSectionProps) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-[#e8ecf8] sm:text-[22px]">
          {t("dashboard.opportunities.title")}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.16] to-transparent" />
        <OpportunityFilters
          labels={{
            all: t("dashboard.opportunities.filters.all"),
            trials: t("dashboard.opportunities.filters.trials"),
            sponsors: t("dashboard.opportunities.filters.sponsors"),
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#0d1430]/60 px-6 py-12 text-center">
        <p className="text-base font-semibold text-[#e8ecf8]">{t("dashboard.opportunities.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-[#8b96b8]">{t("dashboard.opportunities.emptyDescription")}</p>
        <Link
          href="/athletes"
          className="mt-2 inline-flex h-10 items-center rounded-lg bg-[#4d7cff] px-5 text-sm font-bold text-white transition-colors hover:bg-[#6a92ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430]"
        >
          {t("dashboard.opportunities.exploreCta")}
        </Link>
      </div>
    </section>
  );
}
