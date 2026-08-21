import { EcosystemRoleCard } from "./EcosystemRoleCard";

// Images are licensed local stock already in public/images/** (see Hero.tsx
// in features/landing for the source/license note) -- reused across cards
// since we don't have a distinct photo per role, same as the Stitch source
// itself reused a similarly generic photo style across its 8 cards.
const ROLES = [
  {
    title: "Athletes",
    description: "Players across all sports, including para athletes.",
    ctaLabel: "Register Now",
    href: "/auth",
    image: { src: "/images/carousel/athletics.jpg", alt: "" },
  },
  {
    title: "Academies & Coaches",
    description: "Training clubs and coaches.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/carousel/basketball.jpg", alt: "" },
  },
  {
    title: "Performance Experts",
    description: "Physios, nutritionists, and trainers.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/carousel/tennis.jpg", alt: "" },
  },
  {
    title: "Media & Creators",
    description: "Photographers and content creators.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/carousel/swimming.jpg", alt: "" },
  },
  {
    title: "Sports Management & Legal",
    description: "Managers, agents or legal advisors.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/carousel/cricket.jpg", alt: "" },
  },
  {
    title: "Event & Operations Staff",
    description: "Managers, agents or legal advisors.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/carousel/football.jpg", alt: "" },
  },
  {
    title: "Event & Operations Staff",
    description: "Referees and event coordinators.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/profile-banner-track.jpg", alt: "" },
  },
  {
    title: "Sponsors & CSR",
    description: "Brands and corporate sponsors.",
    ctaLabel: "JOIN NOW",
    image: { src: "/images/carousel/athletics.jpg", alt: "" },
  },
] as const;

export function WhoWeServeSection() {
  return (
    <section className="bg-stitch-gray px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="mb-2 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gray-300 md:w-32" />
            <h2 className="text-3xl font-bold text-stitch-navy">Who We Serve</h2>
            <div className="h-px w-16 bg-gray-300 md:w-32" />
          </div>
          <p className="font-medium text-stitch-blue">
            One platform, many roles – one connected sports economy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role, i) => (
            <EcosystemRoleCard key={`${role.title}-${i}`} {...role} />
          ))}
        </div>
      </div>
    </section>
  );
}
