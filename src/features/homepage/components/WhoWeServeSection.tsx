import { EcosystemRoleCard } from "./EcosystemRoleCard";
import type { TFunc } from "@/i18n/dictionary";

// Images are licensed local stock already in public/images/** (see Hero.tsx
// in features/landing for the source/license note) -- reused across cards
// since we don't have a distinct photo per role, same as the Stitch source
// itself reused a similarly generic photo style across its 8 cards.
const ROLE_IMAGES = [
  "/images/carousel/athletics.jpg",
  "/images/carousel/basketball.jpg",
  "/images/carousel/tennis.jpg",
  "/images/carousel/swimming.jpg",
  "/images/carousel/cricket.jpg",
  "/images/carousel/football.jpg",
  "/images/profile-banner-track.jpg",
  "/images/carousel/athletics.jpg",
] as const;

const ROLE_KEYS = [
  "athletes",
  "academies",
  "experts",
  "media",
  "management",
  "operations1",
  "operations2",
  "sponsors",
] as const;

export function WhoWeServeSection({ t }: { t: TFunc }) {
  const roles = ROLE_KEYS.map((key, i) => ({
    title: t(`home.whoWeServe.${key}.title`),
    description: t(`home.whoWeServe.${key}.description`),
    ctaLabel: t(`home.whoWeServe.${key}.cta`),
    href: key === "athletes" ? "/auth" : undefined,
    image: { src: ROLE_IMAGES[i], alt: "" },
  }));

  return (
    <section className="bg-stitch-gray px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="mb-2 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gray-300 md:w-32" />
            <h2 className="text-3xl font-bold text-stitch-navy">{t("home.whoWeServe.heading")}</h2>
            <div className="h-px w-16 bg-gray-300 md:w-32" />
          </div>
          <p className="font-medium text-stitch-blue">{t("home.whoWeServe.subheading")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, i) => (
            <EcosystemRoleCard key={`${ROLE_KEYS[i]}-${i}`} {...role} />
          ))}
        </div>
      </div>
    </section>
  );
}
