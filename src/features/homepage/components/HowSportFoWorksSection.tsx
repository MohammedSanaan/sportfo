import Link from "next/link";
import type { TFunc } from "@/i18n/dictionary";

const STEP_KEYS = ["step1", "step2", "step3"] as const;
const STEP_NUMBERS = ["01", "02", "03"] as const;
const STEP_ICONS = ["search", "growth", "trophy"] as const;

function StepIcon({ icon }: { icon: (typeof STEP_ICONS)[number] }) {
  if (icon === "search") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.35-4.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (icon === "growth") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 21h8m-4-4v4M6 4h12v3a6 6 0 01-12 0V4zM6 5H3v1a4 4 0 004 4M18 5h3v1a4 4 0 01-4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

// The "how it works" step-through, positioned right after GapSection's
// problem statement and before the existing stats/proof content. Reuses
// GapSection's pill/heading/card tokens exactly (radius, shadow, navy/
// orange/gray) rather than the reference screenshot's own styling -- see
// the integration report for why. White background is deliberate: it's the
// one light-tone break between GapSection and StatsSection's grays, not a
// new palette.
export function HowSportFoWorksSection({ t }: { t: TFunc }) {
  const steps = STEP_KEYS.map((key, i) => ({
    number: STEP_NUMBERS[i],
    title: t(`home.howItWorks.${key}Title`),
    description: t(`home.howItWorks.${key}Description`),
    icon: STEP_ICONS[i],
  }));

  return (
    <section className="bg-white px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.howItWorks.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl lg:text-6xl">
          {t("home.howItWorks.titleStart")}{" "}
          <span className="text-stitch-blue">{t("home.howItWorks.titleAccent")}</span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          {t("home.howItWorks.subtitle")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="stitch-card-lift group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover sm:p-8"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-3 -right-2 text-6xl font-bold text-stitch-orange/10 select-none transition-colors duration-300 ease-out group-hover:text-stitch-orange/20"
              >
                {step.number}
              </span>

              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-stitch-orange/10 text-stitch-orange transition-colors duration-300 ease-out group-hover:bg-stitch-orange/20">
                <StepIcon icon={step.icon} />
              </span>

              <h3 className="relative mt-4 text-lg font-bold text-stitch-navy">{step.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/auth"
            className="inline-flex h-13 items-center justify-center rounded px-8 text-base font-bold text-white shadow-lg transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2"
          >
            {t("home.howItWorks.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
