import Link from "next/link";
import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { FEATURED_ATHLETES } from "../data/mock-data";
import type { AthleteCard } from "../data/types";

const FILTERS = [
  { label: "Sport", value: "All sports", active: false },
  { label: "Location", value: "India", active: true },
  { label: "Level", value: "Semi-pro +", active: true },
  { label: "Verified", value: "Only verified", active: true },
];

/**
 * Discovery, shown as the thing itself.
 *
 * Rather than describing search in prose beside an illustration, the section
 * renders a plausible result set: applied filters, a result count, and rows
 * carrying the fields a scout actually sorts on. It is the strongest
 * available argument that a real network sits behind the marketing.
 */
export function DiscoverySection() {
  const results = FEATURED_ATHLETES.slice(0, 5);

  return (
    <section className="relative overflow-hidden bg-navy-975 py-20 sm:py-28 lg:py-32">
      <div aria-hidden className="sf-rules absolute inset-0 opacity-50" />

      <Container className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SpecLabel tone="light">Discovery</SpecLabel>
            <Display tone="light" size="md" className="mt-5 max-w-[16ch]" accent="found.">
              Every profile, built to be
            </Display>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[34ch] text-sm leading-relaxed text-steel-400">
              Academies and sponsors search the register by sport, city,
              level, ranking and verification — and reach the athlete
              directly.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-12 overflow-hidden rounded-sm border border-white/12 bg-navy-950/70 backdrop-blur-sm">
            {/* Query bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/12 p-4 sm:p-5">
              <span className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] text-steel-300">
                <SearchIcon />
                800m · India
              </span>
              {FILTERS.map((filter) => (
                <span
                  key={filter.label}
                  className={
                    filter.active
                      ? "rounded-full border border-brand-400/40 bg-brand-500/12 px-3.5 py-1.5 text-[12px] font-medium text-ice-300"
                      : "rounded-full border border-white/12 px-3.5 py-1.5 text-[12px] font-medium text-steel-400"
                  }
                >
                  {filter.value}
                </span>
              ))}
              <span className="ml-auto text-[12px] text-steel-400 tabular-nums">
                1,284 results
              </span>
            </div>

            <ul>
              {results.map((athlete, i) => (
                <ResultRow key={athlete.id} athlete={athlete} rank={i + 1} />
              ))}
            </ul>

            <div className="flex items-center justify-between gap-4 border-t border-white/12 px-5 py-4">
              <p className="text-[12px] text-steel-400">Showing 5 of 1,284</p>
              <Link
                href="/auth"
                className="-my-1 inline-flex min-h-6 items-center py-1 text-[13px] font-semibold text-white underline-offset-4 hover:underline"
              >
                Open the register
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function ResultRow({ athlete, rank }: { athlete: AthleteCard; rank: number }) {
  return (
    <li className="group border-b border-white/8 transition-colors last:border-0 hover:bg-white/[0.04]">
      <div className="flex items-center gap-4 px-4 py-3.5 sm:gap-5 sm:px-5">
        <span
          aria-hidden
          className="hidden w-5 shrink-0 font-mono text-[11px] text-steel-400 tabular-nums sm:block"
        >
          {String(rank).padStart(2, "0")}
        </span>

        {athlete.photo ? (
          <EditorialImage
            media={athlete.photo}
            grade="light"
            sizes="48px"
            className="h-11 w-11 shrink-0 rounded-full"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-white">
            {athlete.name.slice(0, 1)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[14.5px] font-semibold text-white">
            <span className="truncate">{athlete.name}</span>
            {athlete.verified && (
              <span className="text-ice-300" aria-label="Verified profile" title="Verified profile">
                <VerifiedIcon />
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-[12.5px] text-steel-400">
            {athlete.sport} · {athlete.position} · {athlete.location}
          </p>
        </div>

        <div className="hidden w-28 shrink-0 md:block">
          <p className="text-[10px] tracking-[0.12em] text-steel-400 uppercase">
            {athlete.mark?.label ?? "Ranking"}
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-steel-300 tabular-nums">
            {athlete.mark?.value ?? athlete.ranking}
          </p>
        </div>

        <div className="hidden w-32 shrink-0 lg:block">
          <p className="text-[10px] tracking-[0.12em] text-steel-400 uppercase">Level</p>
          <p className="mt-0.5 text-[13px] font-medium text-steel-300">{athlete.skillLevel}</p>
        </div>

        <span className="shrink-0 rounded-full border border-white/12 px-3.5 py-1.5 text-[12px] font-medium text-steel-300 transition-colors group-hover:border-white/30 group-hover:text-white">
          View
        </span>
      </div>
    </li>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
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
