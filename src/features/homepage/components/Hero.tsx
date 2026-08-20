import Link from "next/link";
import { cn } from "@/lib/cn";
import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";
import { Container, Display, Index, SpecLabel } from "./primitives";
import { FEATURED_ATHLETES, NETWORK_STATS } from "../data/mock-data";
import { SPORTS_VISUALS } from "../data/sports-visuals";

/**
 * The arena.
 *
 * Deliberately not the "headline left, profile card right" split: that
 * arrangement makes the product look like one card, when the point of
 * SportFo is that it is a register of many people. Instead the statement
 * sits over a floodlit pitch, and the roster runs beneath it as a strip of
 * portrait panels that bleeds off both edges — the network continues past
 * the frame. On narrow screens the strip becomes a scrollable rail, which is
 * the same idea rather than a fallback.
 */
export function Hero() {
  const roster = FEATURED_ATHLETES.slice(0, 6);

  return (
    // -mt-16 pulls the arena up under the sticky header so the header can
    // float transparently over it; the matching top padding restores the
    // headline's optical position.
    <section className="relative isolate -mt-16 overflow-hidden bg-navy-975 pt-40 sm:pt-44 lg:pt-52">
      <EditorialImage
        media="stadiumNight"
        grade="deep"
        priority
        inset
        sizes="100vw"
        className="-z-10"
      />
      {/* Holds the type side dark enough to read while letting the stand
          stay visible on the right. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-975 via-navy-975/78 to-transparent"
      />
      <div aria-hidden className="sf-rules absolute inset-0 -z-10 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-b from-transparent to-navy-975"
      />

      <Container>
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
                <span className="font-display font-normal italic tracking-[-0.01em]">
                  record.
                </span>
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
              Explore the network
            </Link>
          </div>
        </Reveal>

        <Reveal delay={260}>
          <dl className="mt-14 flex flex-wrap items-baseline gap-x-9 gap-y-4 border-t border-white/12 pt-6 sm:gap-x-14">
            {NETWORK_STATS.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2.5">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-lg font-semibold tracking-[-0.02em] text-white tabular-nums">
                  {stat.value}
                </dd>
                <span
                  aria-hidden
                  className="text-[11px] font-medium tracking-[0.14em] text-steel-400 uppercase"
                >
                  {stat.label}
                </span>
              </div>
            ))}
            <div className="flex items-baseline gap-2.5">
              <span className="text-lg font-semibold tracking-[-0.02em] text-white tabular-nums">
                {SPORTS_VISUALS.length}
              </span>
              <span className="text-[11px] font-medium tracking-[0.14em] text-steel-400 uppercase">
                Sports
              </span>
            </div>
          </dl>
        </Reveal>
      </Container>

      {/* The roster. A scrollable rail on small screens, a full row on
          desktop — the register reads as many people either way. */}
      <Reveal delay={320}>
        <div className="mt-14 sm:mt-16">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-6 sm:px-8 lg:hidden">
            {roster.map((athlete, i) => (
              <RosterPanel key={athlete.id} athlete={athlete} index={i + 1} />
            ))}
          </div>
          <Container className="hidden lg:block">
            <div className="grid grid-cols-6 gap-3 [&>*]:min-w-0 pb-6">
              {roster.map((athlete, i) => (
                <RosterPanel key={athlete.id} athlete={athlete} index={i + 1} fluid />
              ))}
            </div>
          </Container>
        </div>
      </Reveal>
    </section>
  );
}

function RosterPanel({
  athlete,
  index,
  fluid = false,
}: {
  athlete: (typeof FEATURED_ATHLETES)[number];
  index: number;
  fluid?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-sm border border-white/10 transition-colors duration-500 hover:border-white/25",
        fluid ? "w-full" : "w-[13.5rem] shrink-0 snap-start sm:w-[15rem]",
      )}
    >
      {athlete.photo ? (
        <EditorialImage
          media={athlete.photo}
          grade="medium"
          sizes="(max-width: 640px) 54vw, (max-width: 1024px) 30vw, 17vw"
          className="aspect-[3/4.1] w-full"
          imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="aspect-[3/4.1] w-full bg-navy-900" />
      )}

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-navy-975 via-navy-975/75 to-transparent"
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3.5 pt-3">
        <Index value={index} tone="onImage" />
        {athlete.verified && (
          <span
            className="text-ice-300/90"
            title="Verified profile"
            aria-label="Verified profile"
          >
            <VerifiedIcon />
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5">
        <p className="text-[0.9375rem] leading-tight font-semibold text-white">
          {athlete.name}
        </p>
        <p className="mt-1 text-[11px] font-medium tracking-[0.1em] text-steel-300 uppercase">
          {athlete.sport}
        </p>
        <div className="mt-2.5 flex items-baseline justify-between border-t border-white/15 pt-2.5">
          <span className="text-[10.5px] tracking-[0.08em] text-steel-300 uppercase">
            {athlete.mark?.label ?? "Location"}
          </span>
          <span className="text-xs font-semibold text-white tabular-nums">
            {athlete.mark?.value ?? athlete.location}
          </span>
        </div>
      </div>
    </article>
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

function VerifiedIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
      <path
        d="M8 1.5 13 3.4v3.7c0 3.4-2.1 5.9-5 7.4-2.9-1.5-5-4-5-7.4V3.4L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="m5.7 8.1 1.6 1.6 3.1-3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
