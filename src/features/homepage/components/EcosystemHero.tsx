import Link from "next/link";
import type { TFunc } from "@/i18n/dictionary";
import { SportsIconPattern } from "@/components/ui/SportsIconPattern";
import { HeroCollage } from "./HeroCollagePanel";

// Four panels, each slowly rotating through the sports photo pool with a
// staggered crossfade so the collage stays the same shape while the imagery
// underneath feels alive.
const PANEL_COUNT = 4;

const PANEL_CLIP = "polygon(14% 0%, 100% 0%, 86% 100%, 0% 100%)";
// The final panel keeps a vertical right edge so the collage bleeds flush to
// the viewport edge instead of leaving a triangular gap.
const PANEL_CLIP_LAST = "polygon(14% 0%, 100% 0%, 100% 100%, 0% 100%)";

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

      <div className="relative z-10 flex w-full flex-col px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:gap-6 lg:py-8 lg:pr-0 lg:pl-10 xl:py-10">
        <div className="flex flex-col items-center text-center lg:w-[43%] lg:shrink-0 lg:items-start lg:pr-4 lg:text-left">
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

        {/* Mobile/tablet: flush grid, angled panels don't translate to narrow screens */}
        <div className="mt-8 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:hidden">
          <HeroCollage
            panelCount={PANEL_COUNT}
            clipPaths={Array.from({ length: PANEL_COUNT }, () => "none")}
            wrapperClassNames={Array.from(
              { length: PANEL_COUNT },
              () => "relative aspect-square overflow-hidden rounded-lg sm:rounded-md"
            )}
            sizes="(min-width: 640px) 25vw, 50vw"
          />
        </div>

        {/* Desktop: interlocking diagonal photo collage. Self-stretches to the
            row's full height, then negative vertical margins cancel the
            row's own py so the photos reach the hero's actual top/bottom
            edges instead of floating with blue letterboxing around them. */}
        <div className="relative hidden flex-1 items-stretch self-stretch drop-shadow-[0_20px_45px_rgba(0,0,0,0.35)] lg:flex lg:-my-8 xl:-my-10">
          <HeroCollage
            panelCount={PANEL_COUNT}
            clipPaths={Array.from({ length: PANEL_COUNT }, (_, index) =>
              index === PANEL_COUNT - 1 ? PANEL_CLIP_LAST : PANEL_CLIP
            )}
            wrapperClassNames={Array.from(
              { length: PANEL_COUNT },
              (_, index) => `relative h-full flex-1 overflow-hidden ${index === 0 ? "" : "-ml-12"}`
            )}
            sizes="20vw"
          />
        </div>
      </div>
    </section>
  );
}
