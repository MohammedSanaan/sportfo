import type { TFunc } from "@/i18n/dictionary";

const FEATURE_KEYS = [
  "verifiedIdentity",
  "discovery",
  "academyCollege",
  "eventsTrials",
  "jobsMarketplace",
  "sponsorshipCsr",
] as const;

const FEATURE_ICONS = [
  "badge",
  "search",
  "graduation",
  "calendar",
  "briefcase",
  "partnership",
] as const;

function FeatureIcon({ icon }: { icon: (typeof FEATURE_ICONS)[number] }) {
  if (icon === "badge") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }
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
  if (icon === "graduation") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3L2 8l10 5 10-5-10-5z" strokeLinejoin="round" strokeWidth="2" />
        <path
          d="M6 10.5V16c0 1.5 2.5 3 6 3s6-1.5 6-3v-5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path d="M22 8v6" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === "calendar") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="16" rx="2" strokeWidth="2" />
        <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === "briefcase") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2" />
        <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="12" r="5" strokeWidth="2" />
      <circle cx="16" cy="12" r="5" strokeWidth="2" />
    </svg>
  );
}

// Lighter, icon-led companion to OpportunitiesSection's large image cards
// -- same eyebrow/heading/subtitle rhythm and stitch-card-lift hover as
// every other homepage section, but with a blue top accent (rather than
// orange) and a blue-tinted icon badge, so this reads as the "ecosystem
// overview" grid rather than another orange CTA-driven section.
export function PlatformFeaturesSection({ t }: { t: TFunc }) {
  const features = FEATURE_KEYS.map((key, i) => ({
    key,
    title: t(`home.platform.features.${key}.title`),
    description: t(`home.platform.features.${key}.description`),
    icon: FEATURE_ICONS[i],
  }));

  return (
    <section className="bg-stitch-gray px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-blue/20 bg-stitch-blue/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.platform.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl">
          {t("home.platform.title")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          {t("home.platform.subtitle")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="stitch-card-lift group flex h-full flex-col rounded-lg border border-gray-200 border-t-4 border-t-stitch-blue bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-navy"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stitch-blue/10 text-stitch-blue transition-colors duration-300 ease-out group-hover:bg-stitch-blue/20">
                <FeatureIcon icon={feature.icon} />
              </span>

              <h3 className="mt-4 text-base font-bold text-stitch-navy">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
