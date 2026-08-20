import { EditorialImage } from "./EditorialImage";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { EVENTS } from "../data/mock-data";

/**
 * The calendar.
 *
 * Set against a single editorial image so the page gets one more
 * photographic beat before the closing statement, without another full-bleed
 * section competing with the hero.
 */
export function EventsSection() {
  return (
    <section id="events" className="scroll-mt-16 bg-surface py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="flex flex-col">
            <SpecLabel>Calendar</SpecLabel>
            <Display size="md" className="mt-5 max-w-[12ch]" accent="up.">
              What&rsquo;s coming
            </Display>
            <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-ink-500">
              Trials, tournaments, camps and showcases — each one attached to
              the organisation running it and open to entries from the
              register.
            </p>

            <EditorialImage
              media="blocksClose"
              grade="medium"
              sizes="(max-width: 1024px) 100vw, 32vw"
              className="mt-8 hidden aspect-[4/3] w-full rounded-sm lg:block"
            />
          </Reveal>

          <Reveal delay={100}>
            <ol className="border-t border-border-default">
              {EVENTS.map((event) => (
                <li
                  key={event.id}
                  className="group flex items-center gap-5 border-b border-border-default py-4 transition-colors hover:bg-silver-50 sm:gap-7"
                >
                  <div className="flex w-14 shrink-0 flex-col items-center rounded-sm border border-border-default py-2 tabular-nums">
                    <span className="text-[10px] font-semibold tracking-[0.1em] text-brand-600">
                      {event.month}
                    </span>
                    <span className="text-[1.25rem] leading-tight font-semibold text-ink-900">
                      {event.day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-ink-900">
                      {event.title}
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">
                      {event.sport} · {event.location}
                    </p>
                  </div>

                  <span className="hidden w-32 shrink-0 text-[12.5px] text-ink-400 sm:block">
                    {event.spots}
                  </span>

                  <span className="shrink-0 rounded-full border border-border-strong px-3 py-1 text-[11.5px] font-medium text-ink-600">
                    {event.type}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
