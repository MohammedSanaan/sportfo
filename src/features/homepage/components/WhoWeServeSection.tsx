import Image from "next/image";
import type { TFunc } from "@/i18n/dictionary";

const ROLE_KEYS = [
  "athletes",
  "academiesCoaches",
  "performanceExperts",
  "mediaCreators",
  "managementLegal",
  "eventOperations",
  "sponsorsCsr",
  "talentAnalytics",
] as const;

// The one role with no supporting line in the original copy -- rendered
// title-only rather than inventing new descriptive copy for it.
const ROLE_KEYS_WITHOUT_DESCRIPTION = new Set<(typeof ROLE_KEYS)[number]>(["talentAnalytics"]);

// Licensed local stock already in public/images/** (see Hero.tsx in
// features/landing for the source/license note). Each of the 8 cards gets
// its own distinct image -- reusing the pre-icon-redesign mapping for the
// 5 roles that already had one (athletes/academies/experts/media/
// management), picking one of the old duplicate "Event & Operations
// Staff" pair's two images for the now-single entry, freeing up the other
// for Sponsors & CSR, and giving the new Talent Discovery & Analytics
// category the one remaining not-yet-used asset.
const ROLE_IMAGES: Record<(typeof ROLE_KEYS)[number], string> = {
  athletes: "/images/carousel/athletics.jpg",
  academiesCoaches: "/images/carousel/basketball.jpg",
  performanceExperts: "/images/carousel/tennis.jpg",
  mediaCreators: "/images/carousel/swimming.jpg",
  managementLegal: "/images/carousel/cricket.jpg",
  eventOperations: "/images/carousel/football.jpg",
  sponsorsCsr: "/images/profile-banner-track.jpg",
  talentAnalytics: "/images/hero-track.jpg",
};

// Icon-led "sports ecosystem" overview -- reuses GapSection/
// HowSportFoWorksSection's eyebrow-pill/heading/subtitle rhythm and the
// same stitch-card-lift + orange-top-accent card language as every other
// homepage section. Anchor id is "community" (not "who-we-serve") since
// Header's nav item already points at #community.
export function WhoWeServeSection({ t }: { t: TFunc }) {
  const roles = ROLE_KEYS.map((key) => ({
    key,
    title: t(`home.community.roles.${key}.title`),
    description: ROLE_KEYS_WITHOUT_DESCRIPTION.has(key)
      ? undefined
      : t(`home.community.roles.${key}.description`),
    image: ROLE_IMAGES[key],
  }));

  return (
    <section id="community" className="scroll-mt-16 bg-stitch-gray px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <span className="inline-flex items-center rounded-full border border-stitch-orange/20 bg-stitch-orange/10 px-4 py-1 text-xs font-semibold tracking-wide text-stitch-blue uppercase">
          {t("home.community.eyebrow")}
        </span>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-stitch-navy sm:text-4xl md:text-5xl">
          {t("home.community.title")}
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600">
          {t("home.community.subtitle")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <div
              key={role.key}
              className="stitch-card-lift group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 hover:border-t-stitch-orange-hover"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={role.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                  className="stitch-card-image object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-base font-bold text-stitch-navy">{role.title}</h3>

                {role.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{role.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
