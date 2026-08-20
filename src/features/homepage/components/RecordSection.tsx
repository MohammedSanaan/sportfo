import Link from "next/link";
import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";
import { Container, Display, Index, SpecLabel } from "./primitives";
import { FEATURED_ATHLETES } from "../data/mock-data";

const CREDENTIALS = [
  { label: "Discipline", value: "Athletics — 800m" },
  { label: "Skill level", value: "Amateur" },
  { label: "Club", value: "Kerala Track Club" },
  { label: "Coach", value: "M. Thomas (verified)" },
  { label: "Competing since", value: "2019" },
  { label: "Personal best", value: "2:04.71" },
];

const RESULTS = [
  { meet: "State Athletics Championship", place: "2nd", time: "2:04.71", year: "2025" },
  { meet: "South Zone Inter-University", place: "1st", time: "2:05.98", year: "2025" },
  { meet: "National Junior Open", place: "6th", time: "2:07.12", year: "2024" },
];

const NOTES = [
  {
    title: "Structured, not posted",
    body: "Credentials sit in fields an academy can filter on — not in a feed they have to scroll.",
  },
  {
    title: "Verified at the source",
    body: "Clubs, coaches and event organisers confirm results, so a record carries weight off-platform.",
  },
  {
    title: "It travels with the athlete",
    body: "Change club, city or sport and the history stays attached to the person.",
  },
];

/**
 * The product moment.
 *
 * A photograph alone would be a mood board and a UI screenshot alone would
 * be a spec sheet; the section is built on the seam between them, with the
 * record panel overlapping the image so the abstraction reads as belonging
 * to the athlete in the frame.
 */
export function RecordSection() {
  const athlete = FEATURED_ATHLETES[2];

  return (
    <section
      id="athletes"
      className="relative scroll-mt-16 bg-surface py-20 sm:py-28 lg:py-32"
    >
      <div aria-hidden className="sf-rules-light absolute inset-0 opacity-60" />

      <Container className="relative">
        <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-0">
          {/* Editorial half */}
          <Reveal className="relative lg:pr-10">
            <EditorialImage
              media="sprintStart"
              grade="medium"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="aspect-[4/5] w-full rounded-sm"
            >
              {/* Scrim: the caption sits over an unpredictably bright part of
                  the frame and needs its own contrast, not the image's. */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-navy-975/85 to-transparent"
              />
              {/* Caption lives inside the frame so it stays bound to the
                  image, not to the column's padding. It sits at the top
                  because the record panel overlaps the lower third. */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
                <SpecLabel tone="onImage">Athletics · 800m</SpecLabel>
                <span className="font-mono text-[11px] tracking-[0.1em] whitespace-nowrap text-white/85 tabular-nums">
                  KOCHI, IN
                </span>
              </div>
            </EditorialImage>
          </Reveal>

          {/* The record itself */}
          <Reveal delay={120} className="lg:-ml-16 lg:pt-16">
            <div className="rounded-sm border border-border-default bg-surface shadow-[0_2px_6px_rgba(11,18,32,0.04),0_28px_60px_-32px_rgba(11,18,32,0.3)]">
              <header className="flex items-start justify-between gap-4 border-b border-border-default p-6">
                <div>
                  <SpecLabel>SportFo record</SpecLabel>
                  <p className="mt-3 text-xl font-semibold tracking-[-0.02em] text-ink-900">
                    {athlete.name}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    {athlete.sport} · {athlete.position} · {athlete.location}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-[11px] tracking-[0.08em] text-ink-400 tabular-nums">
                    ID {athlete.id.toUpperCase()}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    Pending verification
                  </p>
                </div>
              </header>

              <dl className="grid grid-cols-2 sm:grid-cols-3">
                {CREDENTIALS.map((field) => (
                  <div
                    key={field.label}
                    className="border-r border-b border-border-default p-4 last:border-r-0"
                  >
                    <dt className="text-[10.5px] font-medium tracking-[0.12em] text-ink-400 uppercase">
                      {field.label}
                    </dt>
                    <dd className="mt-1.5 text-[13px] font-medium text-ink-800 tabular-nums">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <SpecLabel>Results</SpecLabel>
                  <span className="text-[11px] text-ink-400">Last 3 of 9</span>
                </div>
                <table className="mt-4 w-full text-left">
                  <caption className="sr-only">
                    Recent competition results for {athlete.name}
                  </caption>
                  <thead>
                    <tr className="border-b border-border-default">
                      {["Meet", "Place", "Time", "Year"].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="pb-2 pr-3 text-[10.5px] font-medium tracking-[0.12em] text-ink-400 uppercase last:pr-0 last:text-right"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESULTS.map((row) => (
                      <tr key={row.meet} className="border-b border-border-default last:border-0">
                        <td className="py-2.5 pr-3 text-[13px] font-medium text-ink-800">
                          {row.meet}
                        </td>
                        <td className="py-2.5 pr-3 text-[13px] text-ink-600 tabular-nums">
                          {row.place}
                        </td>
                        <td className="py-2.5 pr-3 text-[13px] text-ink-600 tabular-nums">
                          {row.time}
                        </td>
                        <td className="py-2.5 text-right text-[13px] text-ink-500 tabular-nums">
                          {row.year}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>

        {/* The argument, set below the artefact rather than beside it. */}
        <div className="mt-16 grid gap-10 [&>*]:min-w-0 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <SpecLabel>The profile</SpecLabel>
            <Display size="md" className="mt-5 max-w-[16ch]" accent="credential.">
              One profile. Every
            </Display>
            <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-ink-500">
              Social profiles describe an athlete. A record proves one. SportFo
              stores sport, standing, results and verification as structured
              fields, so the people who make selection decisions can act on it.
            </p>
            <Link
              href="/auth"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Build your record
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <ol className="divide-y divide-border-default border-t border-border-default">
              {NOTES.map((note, i) => (
                <li key={note.title} className="flex gap-5 py-5">
                  <Index value={i + 1} className="mt-1 shrink-0" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink-900">{note.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{note.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
