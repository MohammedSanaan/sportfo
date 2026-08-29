import Image from "next/image";

interface RegistrationHeroProps {
  title: string;
  subtitle?: string;
  // A static image already shipped in public/images/ -- never fabricated.
  // Omitted entirely falls back to the same flat navy + radial-gradient
  // treatment ProfileHero already uses when it has no bannerImage, so a
  // category without an obviously-matching photo still looks intentional
  // rather than broken.
  imageSrc?: string;
}

// The shared top banner for every registration page (Athlete and all 7
// generic hub categories) -- same navy scrim + radial-gradient treatment
// already established in ProfileHero.tsx, generalized into its own
// component since ProfileHero is specifically about an athlete's own
// avatar/name and doesn't fit a pre-registration "Register as X" page.
export function RegistrationHero({ title, subtitle, imageSrc }: RegistrationHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-default shadow-sm">
      <div className="relative h-40 sm:h-52 lg:h-56">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-navy-950/78" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(47,102,240,0.4),_transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-center gap-2 px-6 sm:px-10">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-xl text-sm text-white/80 sm:text-base">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}
