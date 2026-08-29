import { HandCoins, CalendarClock, Award } from "lucide-react";
import { DashboardMetricCard } from "./DashboardMetricCard";
import { DemoOnlyButton } from "./DemoOnlyButton";
import type { DashboardDemoData } from "../data/demo-dashboard";

interface MetricCardsRowProps {
  t: (key: string) => string;
  /** DEV/DEMO ONLY -- see demo-dashboard.ts. Undefined outside demo mode. */
  demo?: DashboardDemoData["metrics"];
}

const demoButtonBaseClassName =
  "mt-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430] rounded";
const demoButtonAccentClassName = {
  blue: "text-[#7ea3ff] hover:text-[#a9c1ff]",
  orange: "text-[#ffc457] hover:text-[#ffd992]",
  pink: "text-[#ff7fa4] hover:text-[#ffb0c7]",
} as const;

// SportFo has no sponsorships/trials/academy-invites backend yet, so all
// three always show a real 0 with honest empty-state copy -- never the
// reference design's hardcoded 3/2/1 -- UNLESS `demo` is provided (only in
// dev/demo mode, see AthleteDashboard's `demo` prop), in which case the
// fixed sample values from demo-dashboard.ts are shown instead, each with a
// non-persisting DemoOnlyButton rather than a real action. See
// AthleteDashboardData.stats and the UnavailableSection markers this data
// ultimately traces back to when `demo` is absent.
export function MetricCardsRow({ t, demo }: MetricCardsRowProps) {
  const demoOnlyLabel = t("dashboard.demo.onlyLabel");

  return (
    <section className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
      <DashboardMetricCard
        label={t("dashboard.metrics.sponsorships.label")}
        value={demo ? demo.sponsorships.value : 0}
        helperText={demo ? demo.sponsorships.helperText : t("dashboard.metrics.sponsorships.empty")}
        accent="blue"
        icon={<HandCoins aria-hidden className="h-3.5 w-3.5" />}
        footer={
          demo && (
            <DemoOnlyButton
              label={`${demo.sponsorships.ctaLabel} →`}
              demoOnlyLabel={demoOnlyLabel}
              className={`${demoButtonBaseClassName} ${demoButtonAccentClassName.blue}`}
            />
          )
        }
      />
      <DashboardMetricCard
        label={t("dashboard.metrics.trials.label")}
        value={demo ? demo.trials.value : 0}
        helperText={demo ? demo.trials.helperText : t("dashboard.metrics.trials.empty")}
        actionLabel={demo ? undefined : t("dashboard.metrics.trials.cta")}
        actionHref={demo ? undefined : "/athletes"}
        accent="orange"
        icon={<CalendarClock aria-hidden className="h-3.5 w-3.5" />}
        footer={
          demo && (
            <DemoOnlyButton
              label={`${demo.trials.ctaLabel} →`}
              demoOnlyLabel={demoOnlyLabel}
              className={`${demoButtonBaseClassName} ${demoButtonAccentClassName.orange}`}
            />
          )
        }
      />
      <DashboardMetricCard
        label={t("dashboard.metrics.invites.label")}
        value={demo ? demo.invites.value : 0}
        helperText={demo ? demo.invites.helperText : t("dashboard.metrics.invites.empty")}
        accent="pink"
        icon={<Award aria-hidden className="h-3.5 w-3.5" />}
        footer={
          demo && (
            <DemoOnlyButton
              label={`${demo.invites.ctaLabel} →`}
              demoOnlyLabel={demoOnlyLabel}
              className={`${demoButtonBaseClassName} ${demoButtonAccentClassName.pink}`}
            />
          )
        }
      />
    </section>
  );
}
