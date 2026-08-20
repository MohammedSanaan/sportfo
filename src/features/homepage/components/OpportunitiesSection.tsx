import Link from "next/link";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { OPPORTUNITIES } from "../data/mock-data";

const CATEGORY_TONE: Record<string, string> = {
  Trial: "border-brand-200 bg-brand-50 text-brand-700",
  Sponsorship: "border-border-strong bg-silver-100 text-ink-700",
  Academy: "border-border-strong bg-silver-100 text-ink-700",
  Job: "border-border-strong bg-silver-100 text-ink-700",
  Coaching: "border-border-strong bg-silver-100 text-ink-700",
  Event: "border-border-strong bg-silver-100 text-ink-700",
};

/**
 * Opportunities as a board, not a card grid.
 *
 * These are listings — dense, scannable, with a deadline. Rendering them as
 * rows is both truer to the content and a deliberate change of rhythm after
 * two image-led sections.
 */
export function OpportunitiesSection() {
  return (
    <section
      id="opportunities"
      className="scroll-mt-16 bg-surface py-20 sm:py-28 lg:py-32"
    >
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SpecLabel>Opportunities</SpecLabel>
            <Display size="md" className="mt-5 max-w-[17ch]" accent="opportunity.">
              Talent should lead to
            </Display>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[34ch] text-sm leading-relaxed text-ink-500">
              Trials, sponsorships, academy places, coaching roles and jobs —
              posted by the organisations running them, open to any athlete
              who qualifies.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-12 border-t border-border-default">
            {OPPORTUNITIES.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col gap-3 border-b border-border-default py-5 transition-colors hover:bg-silver-50 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15.5px] font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-[13px] text-ink-500">
                    {item.organization} · {item.location}
                  </p>
                </div>

                <p className="hidden w-52 shrink-0 text-[13px] text-ink-500 lg:block">
                  {item.detail}
                </p>

                <div className="flex items-center gap-4 sm:gap-6">
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-medium ${
                      CATEGORY_TONE[item.category] ?? CATEGORY_TONE.Event
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="w-28 shrink-0 text-right text-[12.5px] whitespace-nowrap text-ink-400 tabular-nums">
                    Closes in {item.closes}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/auth"
              className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              See all opportunities
            </Link>
            <p className="text-[13px] text-ink-400">
              834 open listings across 8 sports and 12 countries.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
