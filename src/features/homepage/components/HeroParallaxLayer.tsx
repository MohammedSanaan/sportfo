"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Wraps the hero's background photo with a small scroll-linked pan --
 * background drifting slightly slower than the page is the cheapest
 * possible depth cue, and the only thing worth borrowing from the reference
 * (frame-diffing it showed no actual animation; it was a still). Range is
 * capped at 36px and covered by the photo's own persistent overscale (see
 * .sf-hero-image in globals.css) so panning never exposes a raw edge.
 * Tracks raw page scroll rather than the hero's own visibility, so the
 * range is fixed and small regardless of hero height -- and since the
 * transform only ever applies to this element (`-z-10`, clipped by the
 * hero section's own `overflow-hidden`), scrolling past the hero can't
 * carry any visible effect into the sections below it.
 */
export function HeroParallaxLayer({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], reduceMotion ? [0, 0] : [0, -36], {
    clamp: true,
  });

  return (
    <motion.div style={{ y }} className={cn("absolute inset-0 -z-10")}>
      {children}
    </motion.div>
  );
}
