import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { ACADEMIES, CREATORS } from "../data/mock-data";

/**
 * Creators and academies in one band.
 *
 * Both were separate card grids before, which made the middle of the page
 * repeat itself. Pairing them contrasts two different registers — people
 * with faces and reach on one side, institutions with dates and headcounts
 * on the other — and says something the separate grids did not: an athlete's
 * reputation is built by both.
 */
export function VoicesSection() {
  return (
    <section id="creators" className="scroll-mt-16 bg-silver-50 py-20 sm:py-28 lg:py-32">
      <Container>
        <Reveal>
          <SpecLabel>Who else is here</SpecLabel>
          <Display size="md" className="mt-5 max-w-[22ch]" accent="record.">
            The people and programmes behind a
          </Display>
        </Reveal>

        <div className="mt-14 grid gap-14 [&>*]:min-w-0 lg:grid-cols-2 lg:gap-16">
          {/* Creators — faces and reach */}
          <Reveal>
            <div className="flex items-baseline justify-between border-b border-border-default pb-3">
              <h3 className="text-[13px] font-semibold tracking-[0.14em] text-ink-900 uppercase">
                Creators
              </h3>
              <span className="text-[12px] text-ink-400 tabular-nums">12,140 on SportFo</span>
            </div>

            <ul className="mt-1">
              {CREATORS.map((creator) => (
                <li
                  key={creator.id}
                  className="flex items-center gap-4 border-b border-border-default py-4"
                >
                  {creator.photo ? (
                    <EditorialImage
                      media={creator.photo}
                      grade="light"
                      sizes="52px"
                      className="h-12 w-12 shrink-0 rounded-full"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold text-ink-900">{creator.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">
                      {creator.role} · {creator.location}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13px] font-medium text-ink-800 tabular-nums">
                      {creator.reach}
                    </p>
                    <p className="text-[10.5px] tracking-[0.1em] text-ink-400 uppercase">
                      Audience
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Academies — institutions and dates */}
          <Reveal delay={100}>
            <div className="flex items-baseline justify-between border-b border-border-default pb-3">
              <h3
                id="academies"
                className="text-[13px] font-semibold tracking-[0.14em] text-ink-900 uppercase"
              >
                Academies
              </h3>
              <span className="text-[12px] text-ink-400 tabular-nums">1,286 registered</span>
            </div>

            <ul className="mt-1">
              {ACADEMIES.map((academy) => (
                <li
                  key={academy.id}
                  className="flex items-center gap-4 border-b border-border-default py-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-surface font-mono text-[11px] font-semibold text-ink-600 tabular-nums">
                    {academy.established}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-ink-900">
                      {academy.name}
                    </p>
                    <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
                      {academy.focus} · {academy.location}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13px] font-medium text-ink-800 tabular-nums">
                      {academy.athletes}
                    </p>
                    <p className="text-[10.5px] tracking-[0.1em] text-ink-400 uppercase">
                      Athletes
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
