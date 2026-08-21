"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A coverflow-style stack -- depth and discovery, not an animation
 * showcase. The centre card sits forward and in focus; neighbours recede
 * in scale, offset and opacity. Dragging or using the arrow controls
 * re-centres the stack; clicking the card already in focus is what
 * actually opens it, so the interaction stays predictable.
 *
 * Circular: index wraps rather than clamps, and each card's position is
 * computed as the *shortest* distance to the active index around the loop.
 * A linear (clamped) version left the first card with nothing to its left
 * and the last with nothing to its right -- dead space that read as
 * broken. Wrapping means every card always has neighbours on both sides,
 * however far you drag in one direction.
 *
 * Optional autoplay drifts the stack one step to the right on a timer,
 * pausing the instant a hand is involved (hover or drag) and never running
 * at all under prefers-reduced-motion -- a slow ambient drift, not
 * something fighting the person trying to browse it.
 */
export function DepthCarousel<T>({
  items,
  getId,
  renderItem,
  onActivate,
  className,
  cardWidthClassName = "w-[13.5rem] sm:w-[15.5rem]",
  stageHeightClassName = "h-[21rem] sm:h-[24rem]",
  spacing = 108,
  visibleNeighbors = 2,
  autoPlayInterval,
}: {
  items: readonly T[];
  getId: (item: T) => string;
  renderItem: (item: T, isActive: boolean) => ReactNode;
  onActivate: (item: T) => void;
  className?: string;
  /** Width classes for each card. Defaults match the original featured-athlete sizing. */
  cardWidthClassName?: string;
  /** Height classes for the stage the cards sit in. */
  stageHeightClassName?: string;
  /** Horizontal offset (px) between adjacent cards -- shrink alongside a narrower cardWidthClassName. */
  spacing?: number;
  /** How many cards render on each side of the centre (2 = 5 cards total, 3 = 7). */
  visibleNeighbors?: number;
  /** Milliseconds between automatic steps to the right. Omit to disable autoplay. */
  autoPlayInterval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = items.length;
  const wrap = (i: number) => ((i % count) + count) % count;
  // Shortest signed distance from `index` to `i` around the loop, e.g. with
  // 10 items, index 0 and i 9 gives -1 (one step left), not 9 (nine steps right).
  const circularDiff = (i: number) => {
    let diff = i - index;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
  };

  useEffect(() => {
    if (!autoPlayInterval || reduceMotion || paused || count < 2) return;
    const id = setInterval(() => setIndex((i) => wrap(i + 1)), autoPlayInterval);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `wrap` only closes over `count`, already a dep
  }, [autoPlayInterval, reduceMotion, paused, count]);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          stageHeightClassName,
        )}
        style={{ perspective: 1400 }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <motion.div
          className="relative h-full w-full touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => setPaused(true)}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) setIndex((i) => wrap(i + 1));
            else if (info.offset.x > 60) setIndex((i) => wrap(i - 1));
          }}
        >
          {items.map((item, i) => {
            const diff = circularDiff(i);
            const isActive = diff === 0;
            const abs = Math.abs(diff);
            if (abs > visibleNeighbors) return null;
            return (
              <motion.button
                key={getId(item)}
                type="button"
                aria-label={isActive ? "Open profile" : "Bring card to focus"}
                onClick={() => (isActive ? onActivate(item) : setIndex(i))}
                className={cn(
                  "absolute top-1/2 left-1/2 h-full -translate-x-1/2 -translate-y-1/2",
                  cardWidthClassName,
                )}
                animate={{
                  x: diff * (reduceMotion ? 0 : spacing),
                  scale: 1 - abs * 0.13,
                  opacity: 1 - abs * (0.85 / visibleNeighbors),
                  zIndex: 10 - abs,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 30 }
                }
              >
                {renderItem(item, isActive)}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <CarouselArrow direction="left" onClick={() => setIndex((i) => wrap(i - 1))} />
        <div className="flex items-center">
          {items.map((item, i) => (
            <button
              key={getId(item)}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              onClick={() => setIndex(i)}
              className="flex h-6 w-6 shrink-0 items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/25 hover:bg-white/40",
                )}
              />
            </button>
          ))}
        </div>
        <CarouselArrow direction="right" onClick={() => setIndex((i) => wrap(i + 1))} />
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous" : "Next"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-steel-300 transition-colors hover:border-white/30 hover:text-white"
    >
      <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
        <path
          d={direction === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
