"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Shared rotation pool: the four sports already shown on first paint, plus two
// more so the collage keeps cycling through fresh photography over time.
const IMAGE_POOL = [
  "/images/carousel/tennis.jpg",
  "/images/carousel/football.jpg",
  "/images/carousel/basketball.jpg",
  "/images/carousel/cricket.jpg",
  "/images/carousel/athletics.jpg",
  "/images/carousel/swimming.jpg",
];

const DISPLAY_MS = 5500;
// Each panel's own crossfade is short; panels are staggered left-to-right so
// the four short fades read as one continuous wave rather than one long
// simultaneous fade. Wave total = 3 * PANEL_STAGGER_MS + TRANSITION_MS.
const TRANSITION_MS = 900;
const PANEL_STAGGER_MS = 100;
const EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
const ENTER_SCALE = 1.02;
const EXIT_SCALE = 0.99;
const ENTER_SHIFT_PX = 10;

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// One shared tick per collage instance (mobile grid and desktop collage each
// get their own). Every panel derives its photo purely from
// `pool[(tick + panelIndex) % pool.length]`, so the four panels always show
// four *consecutive, distinct* pool entries — with a 6-image pool that makes
// it mathematically impossible for two panels to show the same photo, or for
// a panel's outgoing and incoming photo to match.
function useCollageTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, DISPLAY_MS + TRANSITION_MS);
    return () => clearInterval(interval);
  }, []);
  return tick;
}

function HeroCollagePanelView({
  panelIndex,
  clipPath,
  eager,
  sizes,
  tick,
}: {
  panelIndex: number;
  clipPath: string;
  eager?: boolean;
  sizes: string;
  tick: number;
}) {
  const len = IMAGE_POOL.length;
  const activeSlot = (tick % 2) as 0 | 1;
  const reducedMotion = useReducedMotion();

  // Two fixed slots permanently alternate which one is visible. A slot's
  // <img src> is only ever rewritten once it is fully hidden (after its
  // fade-out finishes), so the visible photo never restarts its own
  // transition mid-flight — that restart was what produced the previous
  // duplicate/ghost flash.
  const [slotContent, setSlotContent] = useState<[number, number]>(() => [
    panelIndex % len,
    (1 + panelIndex) % len,
  ]);

  // Once a slot's fade-out (plus this panel's own cascade delay) has fully
  // finished, it's invisible again: safe to load the next unique photo into
  // it, ready for the following reveal. This is the only state mutation the
  // rotation needs — everything else below is derived at render time.
  useEffect(() => {
    const hiddenSlot: 0 | 1 = tick % 2 === 0 ? 1 : 0;
    const settleDelay = panelIndex * PANEL_STAGGER_MS + TRANSITION_MS;
    const timer = setTimeout(() => {
      setSlotContent((prev) => {
        const next: [number, number] = [...prev];
        next[hiddenSlot] = (tick + 1 + panelIndex) % len;
        return next;
      });
    }, settleDelay);

    return () => clearTimeout(timer);
  }, [tick, panelIndex, len]);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ clipPath }}>
      {([0, 1] as const).map((slot) => {
        const isVisible = activeSlot === slot;
        // A hidden slot already holding the preloaded upcoming photo is
        // "fresh" (about to enter, zooms in from ENTER_SCALE); one still
        // holding its just-shown photo is mid fade-out (settles to
        // EXIT_SCALE). Purely derived from render-time data — no extra state.
        const expectedNext = (tick + 1 + panelIndex) % len;
        const isFresh = slotContent[slot] === expectedNext;
        const transform = reducedMotion
          ? undefined
          : isVisible
            ? "scale(1) translate3d(0, 0, 0)"
            : `scale(${isFresh ? ENTER_SCALE : EXIT_SCALE}) translate3d(${isFresh ? ENTER_SHIFT_PX : 0}px, 0, 0)`;

        return (
          <div
            key={slot}
            className="absolute inset-0"
            style={{
              opacity: isVisible ? 1 : 0,
              transform,
              transitionProperty: reducedMotion ? "opacity" : "opacity, transform",
              transitionDuration: `${TRANSITION_MS}ms`,
              transitionTimingFunction: EASING,
              transitionDelay: reducedMotion ? "0ms" : `${panelIndex * PANEL_STAGGER_MS}ms`,
            }}
          >
            <Image
              src={IMAGE_POOL[slotContent[slot]]}
              alt=""
              fill
              preload={eager && slot === 0}
              loading="eager"
              sizes={sizes}
              className="object-cover"
            />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-stitch-blue/20 mix-blend-multiply" />
    </div>
  );
}

export function HeroCollage({
  panelCount,
  clipPaths,
  wrapperClassNames,
  sizes,
}: {
  panelCount: number;
  clipPaths: string[];
  wrapperClassNames: string[];
  sizes: string;
}) {
  const tick = useCollageTick();

  return (
    <>
      {Array.from({ length: panelCount }, (_, index) => (
        <div key={index} className={wrapperClassNames[index]}>
          <HeroCollagePanelView
            panelIndex={index}
            clipPath={clipPaths[index]}
            eager={index === 0}
            sizes={sizes}
            tick={tick}
          />
        </div>
      ))}
    </>
  );
}
