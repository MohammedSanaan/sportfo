"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const DEFAULT_WORDS = ["record.", "legacy.", "story.", "profile."];

/**
 * The headline's closing word, in motion rather than fixed. Same italic
 * accent treatment the static "record." always had -- it just cycles
 * through a short list of equivalents on a slow interval instead of
 * sitting still, each change a soft vertical roll rather than a cut.
 *
 * The accessible name stays fixed to the first word (sr-only, outside the
 * animated node) so screen readers read the sentence once rather than on
 * every rotation; the animated span itself is aria-hidden. An invisible
 * sizer reserves the widest word's width via CSS grid stacking, so the
 * headline's line length never jumps as shorter/longer words cycle
 * through. Freezes on the first word under prefers-reduced-motion.
 */
export function HeroRotatingWord({
  words = DEFAULT_WORDS,
  intervalMs = 2600,
}: {
  words?: string[];
  intervalMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduceMotion, words.length, intervalMs]);

  if (reduceMotion) {
    return (
      <span className="font-display font-normal italic tracking-[-0.01em]">{words[0]}</span>
    );
  }

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <>
      <span className="sr-only">{words[0]}</span>
      <span aria-hidden className="relative inline-grid align-bottom">
        <span
          aria-hidden
          className="invisible col-start-1 row-start-1 font-display font-normal italic tracking-[-0.01em]"
        >
          {longest}
        </span>
        <span className="col-start-1 row-start-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={words[index]}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-60%", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="block font-display font-normal italic tracking-[-0.01em] whitespace-nowrap"
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </>
  );
}
