"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { EditorialImage } from "./EditorialImage";
import { Overlay } from "./Overlay";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { EVENTS } from "../data/mock-data";
import type { EventCard } from "../data/types";

const RANGES = [
  { label: "All", test: () => true },
  { label: "This week", test: (d: number) => d <= 7 },
  { label: "Next 2 weeks", test: (d: number) => d > 7 && d <= 14 },
  { label: "Later", test: (d: number) => d > 14 },
] as const;

const REGISTRATION_TONE: Record<EventCard["registrationStatus"], string> = {
  Open: "border-brand-200 bg-brand-50 text-brand-700",
  "Filling fast": "border-amber-200 bg-amber-50 text-amber-700",
  Waitlist: "border-border-strong bg-silver-100 text-ink-600",
};

/**
 * The calendar, made useful rather than decorative.
 *
 * A compact range strip stands in for a full calendar widget -- it answers
 * "what's coming soon" without spending the vertical space a real month
 * grid would need. Each event is clickable through to a full posting.
 */
export function EventsSection() {
  const [range, setRange] = useState<(typeof RANGES)[number]["label"]>("All");
  const [selected, setSelected] = useState<EventCard | null>(null);

  const activeTest = RANGES.find((r) => r.label === range)!.test;
  const filtered = useMemo(() => EVENTS.filter((e) => activeTest(e.daysFromNow)), [activeTest]);

  return (
    <section id="events" className="scroll-mt-16 bg-silver-50 py-20 sm:py-28 lg:py-32">
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
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events by date">
              {RANGES.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setRange(r.label)}
                  aria-pressed={range === r.label}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors",
                    range === r.label
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-border-default text-ink-500 hover:border-border-strong hover:text-ink-800",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <ol className="mt-6 border-t border-border-default">
              {filtered.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(event)}
                    className="group flex w-full items-center gap-5 border-b border-border-default py-4 text-left transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-none sm:gap-7"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-sm border border-border-default py-2 tabular-nums">
                      <span className="text-[10px] font-semibold tracking-[0.1em] text-brand-600">
                        {event.month}
                      </span>
                      <span className="text-[1.25rem] leading-tight font-semibold text-ink-900">
                        {event.day}
                      </span>
                    </div>

                    {event.image ? (
                      <EditorialImage
                        media={event.image}
                        grade="light"
                        sizes="56px"
                        className="hidden aspect-square w-12 shrink-0 rounded-sm sm:block"
                      />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold text-ink-900">
                        {event.title}
                      </h3>
                      <p className="mt-0.5 text-[12.5px] text-ink-500">
                        {event.sport} · {event.location}
                      </p>
                    </div>

                    <span className="hidden w-32 shrink-0 text-[12.5px] text-ink-400 md:block">
                      {event.spots}
                    </span>

                    <span className="shrink-0 rounded-full border border-border-strong px-3 py-1 text-[11.5px] font-medium text-ink-600">
                      {event.type}
                    </span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="py-8 text-center text-[13px] text-ink-400">
                  No events in this range yet.
                </li>
              )}
            </ol>
          </Reveal>
        </div>
      </Container>

      <Overlay open={selected !== null} onClose={() => setSelected(null)} titleId="event-drawer-title">
        {selected && <EventDrawer event={selected} />}
      </Overlay>
    </section>
  );
}

function EventDrawer({ event }: { event: EventCard }) {
  return (
    <div className="flex flex-1 flex-col">
      {event.image ? (
        <EditorialImage media={event.image} grade="light" sizes="28rem" className="aspect-[4/3] w-full" />
      ) : (
        <div className="aspect-[4/3] w-full bg-navy-900" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <span
          className={cn(
            "inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-medium",
            REGISTRATION_TONE[event.registrationStatus],
          )}
        >
          {event.registrationStatus}
        </span>

        <h2 id="event-drawer-title" className="mt-4 text-xl font-semibold tracking-[-0.02em] text-ink-900">
          {event.title}
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          {event.sport} · {event.location}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border-default py-5">
          <Field label="Date" value={`${event.month} ${event.day}`} />
          <Field label="Type" value={event.type} />
          <Field label="Organizer" value={event.organizer} />
          <Field label="Places" value={event.spots} />
        </dl>

        <div className="mt-5">
          <SpecLabel>About this event</SpecLabel>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-700">{event.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <Link
            href="/auth"
            className="inline-flex h-11 items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Register — sign in to continue
          </Link>
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
