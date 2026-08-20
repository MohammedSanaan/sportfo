"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

export interface CarouselImage {
  src: string;
  alt: string;
}

interface SportsHeroCarouselProps {
  images: CarouselImage[];
  intervalMs?: number;
}

// A small custom implementation rather than a library dependency -- the
// brief only needs current index, a timer, a crossfade, and dots. All
// images are mounted simultaneously (stacked, opacity-toggled) so the
// active slide swap never re-fetches anything; only the first gets
// `priority` (preloaded, no lazy), the rest are `loading="lazy"` and
// requested at a capped size via `sizes`, so five extra photos are never
// pulled in at full hero resolution just to sit behind the first slide.
export function SportsHeroCarousel({ images, intervalMs = 4500 }: SportsHeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotionRef.current || images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPaused, intervalMs, images.length]);

  const goTo = useCallback((next: number) => setIndex(next), []);

  return (
    <div
      className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-navy-900 lg:aspect-[4/5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={i === 0}
          loading={i === 0 ? undefined : "lazy"}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className={cn(
            "object-cover transition-opacity duration-[600ms] ease-in-out motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-transparent" />

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 sm:bottom-5">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${image.alt}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
                i === index ? "w-6 bg-brand-400" : "w-2 bg-white/50 hover:bg-white/75",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
