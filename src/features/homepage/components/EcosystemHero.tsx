import Link from "next/link";
import type { TFunc } from "@/i18n/dictionary";
import { SportsIconPattern } from "@/components/ui/SportsIconPattern";
import { HeroCollage } from "./HeroCollagePanel";

// Four panels, each slowly rotating through the sports photo pool with a
// staggered crossfade so the collage stays the same shape while the imagery
// underneath feels alive. Straight rectangles, not diagonally clipped --
// these particular source photos are thin, low-res crops with very
// different brightness levels, and no amount of clip-path/mask cleverness
// held up across every screen size and rotation. A clean grid with nothing
// cropped into and nothing diagonally cut leaves no seam to go wrong --
// zero gap between tiles so it reads as one continuous strip.
const PANEL_COUNT = 4;

export function EcosystemHero({ t }: { t: TFunc }) {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-stitch-navy">
      {/* Subtle depth: soft top-to-bottom tonal shift, a faint sport-icon
          texture, ambient glow behind the collage, and a restrained
          vignette. Every layer kept faint on purpose. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stitch-blue/15 via-transparent to-black/20"
      />
      <SportsIconPattern className="text-white opacity-[0.04]" />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-10%] hidden h-[85%] w-[55%] -translate-y-1/2 rounded-full bg-stitch-blue/25 blur-[110px] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28)_100%)]"
      />

      <div className="relative z-10 flex w-full flex-col px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:gap-8 lg:py-14 lg:pr-6 lg:pl-10 xl:py-16">
        <div className="flex flex-col items-center text-center lg:w-[42%] lg:shrink-0 lg:items-start lg:text-left">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/75 uppercase sm:text-sm">
            {t("home.hero.eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl leading-[1.05] font-bold whitespace-pre-line text-white sm:text-5xl md:text-6xl lg:text-[3.4rem] xl:text-[3.75rem]">
            {t("home.hero.title")}
          </h1>
          <h2 className="mt-3 text-lg leading-snug font-semibold text-white/90 sm:text-xl md:text-2xl">
            {t("home.hero.secondaryTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base font-medium text-white/85 sm:text-lg lg:mx-0">
            {t("home.hero.description")}
          </p>

          <div className="mt-6 flex w-full max-w-md flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4 lg:mx-0 lg:items-start">
            <Link
              href="#community"
              className="inline-flex h-13 w-full items-center justify-center rounded border border-white/50 px-8 text-base font-bold text-white transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-navy sm:w-auto"
            >
              {t("home.hero.explore")}
            </Link>
            <Link
              href="/auth"
              className="inline-flex h-13 w-full items-center justify-center rounded px-8 text-base font-bold text-white shadow-lg transition-colors duration-300 bg-stitch-orange hover:bg-stitch-orange-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-navy sm:w-auto"
            >
              {t("home.hero.join")}
            </Link>
          </div>
        </div>

        {/* One straight, flush grid for every screen size: 2x2 on mobile,
            a single row of 4 from tablet up -- no gap between tiles, so the
            four photos read as one continuous strip. From lg up, the strip
            stretches to the row's full cross-height, then negative vertical
            margins cancel the row's own py so it reaches the section's true
            top/bottom edges instead of floating with navy letterboxing
            above and below it. */}
        <div className="mt-10 grid w-full grid-cols-2 overflow-hidden sm:grid-cols-4 lg:mt-0 lg:flex lg:flex-1 lg:items-stretch lg:self-stretch lg:-my-14 xl:-my-16">
          <HeroCollage
            panelCount={PANEL_COUNT}
            clipPaths={Array.from({ length: PANEL_COUNT }, () => "none")}
            wrapperClassNames={Array.from(
              { length: PANEL_COUNT },
              () => "group relative aspect-square overflow-hidden sm:aspect-[3/4] lg:aspect-auto lg:flex-1"
            )}
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
