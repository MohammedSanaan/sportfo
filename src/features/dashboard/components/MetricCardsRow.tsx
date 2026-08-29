import { HandCoins, CalendarClock, Award } from "lucide-react";
import { DashboardMetricCard } from "./DashboardMetricCard";

interface MetricCardsRowProps {
  t: (key: string) => string;
}

// SportFo has no sponsorships/trials/academy-invites backend yet, so all
// three always show a real 0 with honest empty-state copy -- never the
// reference design's hardcoded 3/2/1. See AthleteDashboardData.stats and
// the UnavailableSection markers this data ultimately traces back to.
export function MetricCardsRow({ t }: MetricCardsRowProps) {
  return (
    <section className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
      <DashboardMetricCard
        label={t("dashboard.metrics.sponsorships.label")}
        value={0}
        helperText={t("dashboard.metrics.sponsorships.empty")}
        accent="blue"
        icon={<HandCoins aria-hidden className="h-3.5 w-3.5" />}
      />
      <DashboardMetricCard
        label={t("dashboard.metrics.trials.label")}
        value={0}
        helperText={t("dashboard.metrics.trials.empty")}
        actionLabel={t("dashboard.metrics.trials.cta")}
        actionHref="/athletes"
        accent="orange"
        icon={<CalendarClock aria-hidden className="h-3.5 w-3.5" />}
      />
      <DashboardMetricCard
        label={t("dashboard.metrics.invites.label")}
        value={0}
        helperText={t("dashboard.metrics.invites.empty")}
        accent="pink"
        icon={<Award aria-hidden className="h-3.5 w-3.5" />}
      />
    </section>
  );
}
