"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { EditorialImage } from "./EditorialImage";
import { FieldDiagram } from "./field-diagrams";
import { Reveal } from "./Reveal";
import { Container, Display, SpecLabel } from "./primitives";
import { SPORTS_VISUALS } from "../data/sports-visuals";

/**
 * Eight disciplines, one standard.
 *
 * Built as an index rather than a card grid: the sports are a list you read
 * down, and the panel beside it redraws to the selected surface. The
 * constant is the linework — SportFo's claim is that a badminton court and a
 * cricket oval get measured the same way — while photography, where it
 * exists for a discipline, sits underneath as atmosphere.
 */
export function SportsShowcase() {
  const [active, setActive] = useState(0);
  const sport = SPORTS_VISUALS[active];

  return (
    <section className="relative overflow-hidden bg-navy-975 py-20 sm:py-28 lg:py-32">
      <div aria-hidden className="sf-rules absolute inset-0 opacity-60" />

      <Container className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SpecLabel tone="light">Disciplines</SpecLabel>
            <Display tone="light" size="md" className="mt-5 max-w-[15ch]" accent="standard.">
              Every sport. One
            </Display>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[34ch] text-sm leading-relaxed text-steel-400">
              A profile means the same thing whichever surface an athlete
              competes on — the same fields, the same verification, the same
              way of being found.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 [&>*]:min-w-0 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          {/* The index */}
          <Reveal>
            <ul className="border-t border-white/12">
              {SPORTS_VISUALS.map((s, i) => {
                const selected = i === active;
                return (
                  <li key={s.id} className="border-b border-white/12">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-current={selected}
                      className={cn(
                        "group flex w-full items-baseline gap-4 py-3.5 text-left transition-colors sm:gap-5",
                        selected ? "text-white" : "text-steel-400 hover:text-steel-300",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "font-mono text-[11px] tracking-[0.12em] tabular-nums transition-colors",
                          selected ? "text-ice-300" : "text-steel-400",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[1.0625rem] font-medium tracking-[-0.01em]">
                        {s.name}
                      </span>
                      <span className="text-[11px] tracking-[0.08em] tabular-nums">
                        {s.athletes}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* The surface */}
          <Reveal delay={100}>
            <figure className="relative overflow-hidden rounded-sm border border-white/12 bg-navy-950">
              <div key={sport.id} className="relative motion-safe:animate-[fadeIn_0.45s_ease]">
                {sport.image ? (
                  <EditorialImage
                    media={sport.image}
                    grade="backdrop"
                    inset
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                ) : null}

                <div className="relative flex aspect-[4/3] items-center justify-center p-8 sm:aspect-[16/10]">
                  <FieldDiagram
                    sportId={sport.id}
                    aria-hidden
                    className="h-full w-full text-white/45"
                  />
                </div>
              </div>

              <figcaption className="relative flex flex-wrap items-end justify-between gap-4 border-t border-white/12 bg-navy-975/70 px-5 py-4 backdrop-blur-sm">
                <div>
                  <p className="text-[1.0625rem] font-semibold text-white">{sport.name}</p>
                  <p className="mt-1 text-[13px] text-steel-400">{sport.tagline}</p>
                </div>
                <dl className="flex gap-6 text-right">
                  <div>
                    <dt className="text-[10px] tracking-[0.12em] text-steel-400 uppercase">
                      Surface
                    </dt>
                    <dd className="mt-1 text-[12px] font-medium text-steel-300 tabular-nums">
                      {sport.surface}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.12em] text-steel-400 uppercase">
                      Events
                    </dt>
                    <dd className="mt-1 text-[12px] font-medium text-steel-300 tabular-nums">
                      {sport.events}
                    </dd>
                  </div>
                </dl>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
