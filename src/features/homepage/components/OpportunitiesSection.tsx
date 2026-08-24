import Image from "next/image";
import type { TFunc } from "@/i18n/dictionary";

// Licensed local stock already in public/images/** (see Hero.tsx in
// features/landing for the source/license note) -- every existing asset
// is already reused at least once elsewhere on the homepage (e.g.
// hero-track.jpg backs both the hero and a Community card), so reusing
// them again here for a thematically-fitting card is consistent with
// that established pattern rather than a new exception.
const CARD_IMAGES = {
  events: "/images/carousel/athletics.jpg",
  jobs: "/images/carousel/cricket.jpg",
  courses: "/images/profile-banner-track.jpg",
} as const;

// Neither a jobs marketplace, an events/trials system, nor a courses
// catalog exists in this app yet (only /, /auth, /athlete/register,
// /athlete/profile, /athletes, /a/[slug] are real routes). Every button
// below is deliberately a plain, handler-less <button> -- visually ready,
// safely inert -- following the same precedent already established for
// CTAs with no real destination (see the removed EcosystemRoleCard.tsx).
function InertButton({
  label,
  variant,
  size = "md",
}: {
  label: string;
  variant: "primary" | "secondary";
  size?: "md" | "sm";
}) {
  const padding = size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-5 py-2 text-sm";
  const primary = `rounded ${padding} font-semibold whitespace-nowrap text-white shadow transition-colors bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2`;
  const secondary = `rounded border border-stitch-navy/30 ${padding} font-semibold whitespace-nowrap text-stitch-navy transition-colors hover:bg-stitch-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-navy focus-visible:ring-offset-2`;

  return (
    <button type="button" className={variant === "primary" ? primary : secondary}>
      {label}
    </button>
  );
}

export function OpportunitiesSection({ t }: { t: TFunc }) {
  return (
    <section id="opportunity" className="scroll-mt-16 bg-white px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.opportunities.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl">
          {t("home.opportunities.title")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          {t("home.opportunities.subtitle")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <div className="stitch-card-lift group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={CARD_IMAGES.events}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="stitch-card-image object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h3 className="text-lg font-bold text-stitch-navy">{t("home.opportunities.events.title")}</h3>
              <p className="mt-2 text-sm font-medium text-stitch-blue">
                {t("home.opportunities.events.categories")}
              </p>
              <div className="mt-auto flex flex-nowrap gap-3 pt-6">
                <InertButton label={t("home.opportunities.events.postCta")} variant="primary" size="sm" />
                <InertButton label={t("home.opportunities.events.cta")} variant="secondary" size="sm" />
              </div>
            </div>
          </div>

          <div className="stitch-card-lift group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={CARD_IMAGES.jobs}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="stitch-card-image object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h3 className="text-lg font-bold text-stitch-navy">{t("home.opportunities.jobs.title")}</h3>
              <p className="mt-2 text-sm font-medium text-stitch-blue">
                {t("home.opportunities.jobs.categories")}
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <InertButton label={t("home.opportunities.jobs.postJob")} variant="primary" />
                <InertButton label={t("home.opportunities.jobs.viewAll")} variant="secondary" />
              </div>
            </div>
          </div>

          <div className="stitch-card-lift group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={CARD_IMAGES.courses}
                alt=""
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="stitch-card-image object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-8">
              <h3 className="text-lg font-bold text-stitch-navy">{t("home.opportunities.courses.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t("home.opportunities.courses.description")}
              </p>
              <div className="mt-auto flex flex-nowrap gap-3 pt-6">
                <InertButton label={t("home.opportunities.courses.cta")} variant="primary" size="sm" />
                <InertButton label={t("home.opportunities.courses.viewAll")} variant="secondary" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
