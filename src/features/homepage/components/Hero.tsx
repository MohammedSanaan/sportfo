import Link from "next/link";
import { AnimatedStat } from "./AnimatedStat";
import { EditorialImage } from "./EditorialImage";
import { HeroParallaxLayer } from "./HeroParallaxLayer";
import { HeroRotatingWord } from "./HeroRotatingWord";
import { HeroSportsCarousel } from "./HeroSportsCarousel";
import { Reveal } from "./Reveal";
import { TextRoll } from "./TextRoll";
import { Container, Display, SpecLabel } from "./primitives";
import { NETWORK_STATS, SPORTS } from "../data/mock-data";

/**
 * The arena.
 *
 * The statement sits over a floodlit pitch, panned by a few pixels as the
 * page scrolls (HeroParallaxLayer) so it reads as a photograph with depth
 * rather than a flat backdrop. On wide screens a sports carousel
 * (HeroSportsCarousel) sits inset on the right, over the photo -- real
 * disciplines, not a second row of athlete cards duplicating Discovery.
 * Hidden below `xl` so the single-column layout on narrower screens is
 * untouched.
 */
export function Hero() {
  return (
    // -mt-16 pulls the arena up under the sticky header so the header can
    // float transparently over it; the matching top padding restores the
    // headline's optical position.
    <section className="relative isolate -mt-16 overflow-hidden bg-navy-975 pt-40 sm:pt-44 lg:pt-52">
      <HeroParallaxLayer>
        <EditorialImage
          media="heroAthlete"
          grade="deep"
          priority
          inset
          sizes="100vw"
          imageClassName="sf-hero-image"
        />
      </HeroParallaxLayer>
      {/* Holds the type side dark enough to read while letting the stand
          stay visible on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-975 via-navy-975/78 to-transparent"
      />
      {/* A slow diagonal light sweep -- the cheapest way to give the arena
          photo a sense of motion/energy on load, closest in mood to the
          reference clip without literally being a video. */}
      <div aria-hidden className="sf-hero-sheen -z-10" />
      <div aria-hidden className="sf-rules absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-b from-transparent to-navy-975"
      />

      <HeroSportsCarousel />

      {/* -translate-y-5 (20px): nudges the text column up slightly to
          rebalance against the carousel's new lower-right position,
          without actually resizing or repositioning the section. */}
      <Container className="-translate-y-5">
        <Reveal>
          <SpecLabel tone="light">The professional network for sport</SpecLabel>
        </Reveal>

        <Reveal delay={80}>
          <Display
            as="h1"
            size="xl"
            tone="light"
            className="mt-7 max-w-[19ch]"
            after={
              <>
                {" "}
                <HeroRotatingWord />
              </>
            }
          >
            Every athlete deserves a professional
          </Display>
        </Reveal>

        <Reveal delay={140}>
          <p className="mt-7 max-w-[46ch] text-base leading-relaxed text-steel-300 sm:text-[1.0625rem]">
            SportFo is where athletes build a verified profile — sport,
            achievements, standing and history — and where academies, sponsors
            and clubs come to find them.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-white px-7 text-sm font-semibold text-navy-950 transition-colors hover:bg-silver-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy-975 focus-visible:outline-none"
            >
              Create your profile
              <ArrowIcon />
            </Link>
            <Link
              href="#athletes"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              <TextRoll>Explore the network</TextRoll>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={260}>
          <dl className="mt-14 flex flex-wrap items-baseline gap-x-9 gap-y-4 border-t border-white/12 pt-6 sm:gap-x-14">
            <div className="flex items-baseline gap-2.5">
              <dt className="sr-only">Sports</dt>
              <dd className="text-lg font-semibold tracking-[-0.02em] text-white tabular-nums">
                <AnimatedStat value={SPORTS.length} />
              </dd>
              <span
                aria-hidden
                className="text-[11px] font-medium tracking-[0.14em] text-steel-400 uppercase"
              >
                Sports
              </span>
            </div>
            {/* No real count behind these yet (see NETWORK_STATS in
                mock-data.ts) -- shown as a plain status rather than an
                animated number, so nothing here reads as a headcount claim
                that isn't true yet. */}
            {NETWORK_STATS.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2.5">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-lg font-semibold tracking-[-0.02em] text-steel-500 italic">
                  Soon
                </dd>
                <span
                  aria-hidden
                  className="text-[11px] font-medium tracking-[0.14em] text-steel-400 uppercase"
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <path
        d="M2.5 8h11M9.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </svg>
  );
}
