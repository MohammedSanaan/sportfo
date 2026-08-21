"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { EditorialImage } from "./EditorialImage";
import { ExpandableCard } from "./ExpandableCard";
import { TextRoll } from "./TextRoll";
import { Reveal } from "./Reveal";
import { useSportFilter } from "./SportFilterContext";
import { Container, Display, Index, SpecLabel } from "./primitives";
import { FEATURED_ATHLETES } from "../data/mock-data";
import type { AthleteCard } from "../data/types";

/**
 * Discovery, shown as the thing itself.
 *
 * Rather than describing search in prose beside an illustration, the
 * section renders a filterable, clickable result set -- the strongest
 * available argument that a real network sits behind the page.
 */
// One page is enough rows to read as "the grid expanded", not enough that
// pagination becomes pointless -- 3 rows at the widest (4-column) layout.
const PAGE_SIZE = 12;

export function DiscoverySection() {
  const { sport, setSport } = useSportFilter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [skillLevel, setSkillLevel] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const sports = useMemo(
    () => ["All", ...Array.from(new Set(FEATURED_ATHLETES.map((a) => a.sport)))],
    [],
  );
  const locations = useMemo(
    () => ["All", ...Array.from(new Set(FEATURED_ATHLETES.map((a) => a.location)))],
    [],
  );
  const skillLevels = useMemo(
    () => ["All", ...Array.from(new Set(FEATURED_ATHLETES.map((a) => a.skillLevel)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FEATURED_ATHLETES.filter((a) => {
      if (sport !== "All" && a.sport !== sport) return false;
      if (location !== "All" && a.location !== location) return false;
      if (skillLevel !== "All" && a.skillLevel !== skillLevel) return false;
      if (verifiedOnly && !a.verified) return false;
      if (q && !`${a.name} ${a.club} ${a.location}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sport, location, skillLevel, verifiedOnly, search]);

  // Reset to page 1 whenever the filter set changes, so pagination always
  // starts from the same predictable first page.
  const filterKey = `${sport}|${location}|${skillLevel}|${verifiedOnly}|${search}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const results = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function goToPage(p: number) {
    setPage(p);
    document.getElementById("athletes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="athletes"
      className="relative scroll-mt-16 overflow-hidden border-t border-white/10 bg-navy-900 py-20 sm:py-28 lg:py-32"
    >
      {/* A short fade from the hero's navy-975 into this section's own
          navy-900 -- on top of the border-t, this is what turns "same
          colour, no boundary" into a section that visibly starts here,
          confirmed by screenshot rather than a colour picker. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-975 to-transparent"
      />
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

        {/* A real, working toolbar rather than more prose about search --
            same glass-panel treatment as the hero's sport carousel, on
            purpose, so the two read as one product surface. */}
        <Reveal delay={120}>
          <div className="mt-14 rounded-2xl border border-white/10 bg-navy-950/40 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <label className="relative flex-1 sm:min-w-[13rem]">
                <span className="sr-only">Search athletes</span>
                <SearchGlyph className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-steel-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, club or city"
                  className="h-10 w-full rounded-full border border-white/15 bg-navy-975/60 py-2 pr-4 pl-9 text-[13.5px] text-white placeholder:text-steel-500 focus:border-brand-400 focus:outline-none"
                />
              </label>

              <FilterSelect label="Location" value={location} onChange={setLocation} options={locations} />
              <FilterSelect label="Skill level" value={skillLevel} onChange={setSkillLevel} options={skillLevels} />

              <button
                type="button"
                onClick={() => setVerifiedOnly((v) => !v)}
                aria-pressed={verifiedOnly}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors",
                  verifiedOnly
                    ? "border-brand-400 bg-brand-500/25 text-white"
                    : "border-white/15 bg-navy-975/60 text-steel-300 hover:border-white/30 hover:text-white",
                )}
              >
                <VerifiedIcon />
                Verified only
              </button>
            </div>

            {/* Sport chips -- the only filter here that also doubles as a
                control the hero's sport carousel can drive (see
                SportFilterContext). */}
            <div className="mt-4 flex flex-wrap gap-2.5" role="group" aria-label="Filter by sport">
              {sports.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  aria-pressed={sport === s}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors",
                    sport === s
                      ? "border-brand-400 bg-brand-500/25 text-white"
                      : "border-white/25 bg-white/5 text-steel-300 hover:border-white/40 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-8 flex items-baseline justify-between">
            <p className="text-[12px] text-steel-400 tabular-nums">
              {filtered.length === 0
                ? "No profiles match these filters"
                : `Showing ${results.length} of ${filtered.length} matching profiles`}
            </p>
            <Link
              href="/auth"
              className="-my-1 inline-flex min-h-6 items-center py-1 text-[13px] font-semibold text-white underline-offset-4 hover:underline"
            >
              Open the register
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-navy-950/30 px-6 py-14 text-center">
              <p className="text-[14px] text-steel-300">
                No athletes match this combination of filters yet.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSport("All");
                  setLocation("All");
                  setSkillLevel("All");
                  setVerifiedOnly(false);
                  setSearch("");
                }}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-full border border-white/20 px-5 text-[13px] font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <ExpandableCard
                items={results}
                getId={(a) => a.id}
                activeId={activeId}
                onActiveChange={setActiveId}
                gridClassName="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                renderCollapsed={(athlete) => (
                  <AthleteTile athlete={athlete} index={results.indexOf(athlete) + 1} />
                )}
                renderExpanded={(athlete, close) => <AthleteExpanded athlete={athlete} onClose={close} />}
              />
              {totalPages > 1 && (
                <nav aria-label="Athlete results pages" className="mt-8 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white/20 px-4 text-[13px] font-medium text-steel-300 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[13px] font-medium tabular-nums transition-colors",
                        p === currentPage
                          ? "border-brand-400 bg-brand-500/25 text-white"
                          : "border-white/20 text-steel-300 hover:border-white/40 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-white/20 px-4 text-[13px] font-medium text-steel-300 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

function AthleteTile({ athlete, index }: { athlete: AthleteCard; index: number }) {
  return (
    <div className="group relative overflow-hidden rounded-sm border border-white/12 bg-navy-950/60 transition-colors hover:border-white/25">
      {athlete.photo ? (
        <EditorialImage
          media={athlete.photo}
          grade="medium"
          sizes="(max-width: 640px) 62vw, 17vw"
          className="aspect-[4/3.1] w-full"
          imageClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="aspect-[4/3.1] w-full bg-navy-900" />
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3.5">
        <Index value={index} tone="onImage" />
        {athlete.verified && (
          <span className="text-ice-300/90" title="Verified profile" aria-label="Verified profile">
            <VerifiedIcon />
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-[15.5px] font-semibold text-white">{athlete.name}</p>
        <p className="mt-1 text-[12.5px] text-steel-400">
          {athlete.sport} · {athlete.position}
        </p>
        <p className="mt-0.5 text-[12px] text-steel-500">{athlete.location}</p>

        <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-3.5">
          <div>
            <p className="text-[10px] tracking-[0.1em] text-steel-500 uppercase">
              {athlete.mark?.label ?? "Ranking"}
            </p>
            <p className="mt-0.5 text-[13px] font-medium text-steel-300 tabular-nums">
              {athlete.mark?.value ?? athlete.ranking}
            </p>
          </div>
          <span className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-medium text-steel-300 transition-colors group-hover:border-white/30 group-hover:text-white">
            View
          </span>
        </div>
      </div>
    </div>
  );
}

function AthleteExpanded({ athlete, onClose }: { athlete: AthleteCard; onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative">
        {athlete.photo ? (
          <EditorialImage media={athlete.photo} grade="light" sizes="36rem" className="aspect-[16/9] w-full" />
        ) : (
          <div className="aspect-[16/9] w-full bg-navy-900" />
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface text-ink-500 shadow-sm transition-colors hover:border-border-strong hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">{athlete.name}</h2>
            <p className="mt-1 text-sm text-ink-500">
              {athlete.sport} · {athlete.position} · {athlete.location}
            </p>
          </div>
          {athlete.verified && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              <span className="text-brand-600">
                <VerifiedIcon />
              </span>
              Verified
            </span>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border-default py-5">
          <Field label="Skill level" value={athlete.skillLevel} />
          <Field label="Ranking" value={athlete.ranking} />
          <Field label="Club / academy" value={athlete.club} />
          <Field label={athlete.mark?.label ?? "Headline mark"} value={athlete.mark?.value ?? "—"} />
        </dl>

        {athlete.achievements && athlete.achievements.length > 0 && (
          <div className="mt-5">
            <SpecLabel>Achievements</SpecLabel>
            <ul className="mt-3 flex flex-col gap-2">
              {athlete.achievements.map((a) => (
                <li key={a} className="text-[13.5px] leading-relaxed text-ink-700">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-8">
          {/* /athlete/[id] does its own auth gate -- redirects a signed-out
              visitor to /auth itself, so there's no need to duplicate that
              check here. Signed in, it resolves to the real profile (or a
              404 if this particular id has no match, since Discovery is
              still showing demo athletes rather than real ones). */}
          <Link
            href={`/athlete/${athlete.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <TextRoll>View full profile</TextRoll>
          </Link>
          <p className="text-center text-[12px] text-ink-400">
            Sign in to view verified profiles and full history.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-medium tracking-[0.12em] text-ink-400 uppercase">{label}</dt>
      <dd className="mt-1 text-[13.5px] font-medium text-ink-800">{value}</dd>
    </div>
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

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-full border border-white/15 bg-navy-975/60 py-2 pr-9 pl-4 text-[13px] font-medium text-steel-300 focus:border-brand-400 focus:outline-none sm:w-auto"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-navy-950 text-white">
            {o === "All" ? `${label}: All` : o}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-steel-500" />
    </label>
  );
}

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={cn("h-3.5 w-3.5", className)}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.8 10.8 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className={cn("h-3 w-3", className)}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
