"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/cn";

export interface Carousel3DItem {
  key: string;
  title: string;
  image: string;
}

interface Carousel3DProps {
  items: Carousel3DItem[];
  onSelect?: (item: Carousel3DItem) => void;
  className?: string;
}

// Degrees of ring rotation per pixel of horizontal drag.
const DRAG_SENSITIVITY = 0.35;
// Below this much net pointer movement, a pointer-up counts as a click on
// the card rather than the end of a drag.
const CLICK_MOVE_THRESHOLD = 6;
const AUTOROTATE_DEG_PER_SEC = 7;
// Exponential decay applied to release velocity every frame during
// inertia -- higher = the ring coasts to a stop sooner.
const INERTIA_FRICTION_PER_SEC = 0.94;
const MIN_INERTIA_VELOCITY = 2; // deg/sec -- inertia loop stops below this

// Cards stay on the full underlying ring (so drag/inertia is a normal
// endless spin, front card wrapping to back seamlessly) but only the ones
// within this many degrees of dead-ahead are ever visible. Past that they
// fade out entirely, so you only ever see a semicircle-ish arc facing you
// -- never the far side of the ring, never a hard "where does this end"
// edge, and never a wall of full-brightness cards behind the front ones.
const VISIBLE_HALF_ARC = 150;
const FADE_START = 90; // degrees off-center where opacity/scale start easing down
// Radius as a fraction of the carousel's own rendered width -- NOT derived
// from card size/count. A "just enough to avoid overlap around the full
// 360" radius packs every card close to the center, so with the back half
// hidden you'd mostly see one dominant front card with barely-separated
// neighbors peeking from behind it. Sizing off the container instead
// spreads the visible arc out to use the space actually available, so it
// reads as a fan of cards, not a single card with siblings hiding behind
// it. sin(VISIBLE_HALF_ARC) puts the fade-out edge close to the container's
// half-width; overflow-hidden on the container is the backstop for the
// (already near-invisible) cards just past it.
const FAN_RADIUS_RATIO = 0.26;

function normalizeAngle(deg: number): number {
  const wrapped = ((deg % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

function Carousel3DCard({
  item,
  baseAngle,
  radius,
  rotateY,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  item: Carousel3DItem;
  baseAngle: number;
  radius: number;
  rotateY: MotionValue<number>;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
}) {
  // Derived straight from the shared rotateY motion value, so every card
  // re-renders its own transform/opacity on every drag/inertia/auto-rotate
  // tick without the parent (or any other card) re-rendering.
  //
  // Deliberately a single raw `transform` string bound as one motion value,
  // rather than framer's separate rotateY/z/scale style shorthands: framer
  // composes those shorthands in a *fixed* translate-then-rotate-then-scale
  // order, which folds z into the same translate3d as x/y and applies it
  // BEFORE rotation -- wrong geometry for "rotate around the ring, then
  // push out along the rotated Z axis" (rotateY(deg) translateZ(radius)).
  // A hand-built string is the only way to get that order, and mixing it
  // with any of framer's own shorthand keys on the same element makes
  // framer silently discard the manual string and use its own instead.
  const angleFromFront = useTransform(rotateY, (r) => Math.abs(normalizeAngle(baseAngle + r)));
  const opacity = useTransform(angleFromFront, (a) => {
    if (a >= VISIBLE_HALF_ARC) return 0;
    if (a <= FADE_START) return 1;
    const t = (a - FADE_START) / (VISIBLE_HALF_ARC - FADE_START);
    return 1 - t * 0.85;
  });
  const transform = useTransform(angleFromFront, (a) => {
    const t = Math.min(1, Math.max(0, (a - FADE_START) / (VISIBLE_HALF_ARC - FADE_START)));
    const scale = 1 - t * 0.22;
    return `translate(-50%, -50%) rotateY(${baseAngle}deg) translateZ(${radius}px) scale(${scale})`;
  });
  const pointerEvents = useTransform(angleFromFront, (a) => (a >= VISIBLE_HALF_ARC ? "none" : "auto"));

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 h-full w-[clamp(52px,10vw,84px)] cursor-grab touch-pan-y active:cursor-grabbing"
      style={{
        transform,
        opacity,
        pointerEvents,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="group relative h-full w-full overflow-hidden rounded-xl border border-white/15 bg-stitch-navy shadow-[0_10px_22px_rgba(3,15,40,0.4)] transition-transform duration-300 will-change-transform hover:-translate-y-1">
        <Image
          src={item.image}
          alt={item.title}
          fill
          draggable={false}
          // Deliberately requested larger than the card ever renders (max
          // 84px): these cards live inside a 3D rotateY/scale transform, and
          // over-fetching resolution gives the browser's own downsample
          // pass more detail to work with than an exact-size fetch would --
          // exact-size fetches were reading as soft/blurry once transformed.
          sizes="220px"
          quality={90}
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-navy/90 via-stitch-navy/10 to-transparent" />
        <p className="pointer-events-none absolute inset-x-0 bottom-0 px-1.5 pb-1.5 text-center text-[8px] leading-tight font-semibold tracking-wide text-white uppercase sm:px-2 sm:pb-2 sm:text-[10px]">
          {item.title}
        </p>
      </div>
    </motion.div>
  );
}

// A draggable fan of cards in 3D space: every card sits on a full 360 ring
// via rotateY(i * angleStep) translateZ(radius) so drag/inertia is an
// ordinary endless spin, but Carousel3DCard fades/hides anything past
// VISIBLE_HALF_ARC from dead-center -- so what's actually on screen always
// reads as a single facing semicircle, never the ring's far side. Radius is
// sized off the carousel's own rendered width (measured via
// ResizeObserver), not card size, so the visible arc spreads across the
// available space instead of clustering near the front.
export function Carousel3D({ items, onSelect, className }: Carousel3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotateY = useMotionValue(0);
  const [radius, setRadius] = useState(0);
  const angleStep = items.length > 0 ? 360 / items.length : 0;

  const pausedRef = useRef(false);
  const dragRef = useRef<{
    startX: number;
    startRotation: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);
  const inertiaRef = useRef<number | null>(null);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) {
        setRadius(Math.round(w * FAN_RADIUS_RATIO));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Idle auto-rotate: a slow, constant drift that pauses the instant a drag
  // or an inertia coast is in progress, and resumes once both end.
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!pausedRef.current && inertiaRef.current === null) {
        rotateY.set(rotateY.get() + AUTOROTATE_DEG_PER_SEC * dt);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rotateY]);

  const stopInertia = useCallback(() => {
    if (inertiaRef.current !== null) {
      cancelAnimationFrame(inertiaRef.current);
      inertiaRef.current = null;
    }
  }, []);

  const runInertia = useCallback(
    (initialVelocity: number) => {
      let velocity = initialVelocity;
      let last = performance.now();
      const step = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        rotateY.set(rotateY.get() + velocity * dt);
        velocity *= Math.pow(INERTIA_FRICTION_PER_SEC, dt * 60);
        if (Math.abs(velocity) > MIN_INERTIA_VELOCITY) {
          inertiaRef.current = requestAnimationFrame(step);
        } else {
          inertiaRef.current = null;
        }
      };
      stopInertia();
      inertiaRef.current = requestAnimationFrame(step);
    },
    [rotateY, stopInertia],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Capture is best-effort: an inactive/synthetic pointerId throws here
      // in some environments, and losing capture only means a drag that
      // continues past the card's own bounds stops updating -- it must
      // never block the click/drag bookkeeping below.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      stopInertia();
      pausedRef.current = true;
      dragRef.current = {
        startX: e.clientX,
        startRotation: rotateY.get(),
        lastX: e.clientX,
        lastT: performance.now(),
        velocity: 0,
      };
    },
    [rotateY, stopInertia],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      rotateY.set(drag.startRotation + dx * DRAG_SENSITIVITY);

      const now = performance.now();
      const dt = now - drag.lastT;
      if (dt > 0) {
        drag.velocity = ((e.clientX - drag.lastX) * DRAG_SENSITIVITY) / (dt / 1000);
      }
      drag.lastX = e.clientX;
      drag.lastT = now;
    },
    [rotateY],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, item: Carousel3DItem) => {
      const drag = dragRef.current;
      dragRef.current = null;
      pausedRef.current = false;
      if (!drag) return;

      const totalMoved = Math.abs(e.clientX - drag.startX);
      if (totalMoved < CLICK_MOVE_THRESHOLD) {
        selectRef.current?.(item);
        return;
      }

      if (Math.abs(drag.velocity) > MIN_INERTIA_VELOCITY) {
        runInertia(drag.velocity);
      }
    },
    [runInertia],
  );

  const handlePointerCancel = useCallback(() => {
    dragRef.current = null;
    pausedRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden select-none [perspective:1400px]",
        className,
      )}
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        if (!dragRef.current) pausedRef.current = false;
      }}
    >
      <motion.div
        className="relative mx-auto h-full [transform-style:preserve-3d]"
        style={{ rotateY }}
      >
        {items.map((item, i) => (
          <Carousel3DCard
            key={item.key}
            item={item}
            baseAngle={i * angleStep}
            radius={radius}
            rotateY={rotateY}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(e, item)}
            onPointerCancel={handlePointerCancel}
          />
        ))}
      </motion.div>
    </div>
  );
}
