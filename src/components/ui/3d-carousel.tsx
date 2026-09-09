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
//
// These are caps, not fixed values -- a ring with few items (wide angleStep)
// still uses them as-is, but a ring with many items (e.g. the 16-sport
// gallery) would otherwise keep ~13 of 16 cards "visible" at once, which a
// wide desktop container has room to spread out but a narrow mobile
// container does not: card width has a 108px floor (see the clamp() below)
// that doesn't shrink with a smaller radius, so a crowded ring on a narrow
// container reads as a wall of overlapping slivers instead of a fan. Capping
// how many cards-deep are shown on each side (see CARDS_VISIBLE_EACH_SIDE in
// Carousel3D) keeps the fan legible at any item count or container width.
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
//
// A phone-width container gets a bigger ratio than a wide one: fewer cards
// are shown deep on narrow screens (see CARDS_VISIBLE_EACH_SIDE_* below),
// so the same 0.42 that spreads 3-deep nicely on desktop would leave a
// 1-or-2-deep mobile fan clustered too close to the front card -- neighbors
// barely peeking out instead of reading as separate cards.
//
// Tablet is its own tier, not desktop's ratio stretched over a smaller
// container: the gallery section is capped at max-w-6xl (1152px), so
// desktop's radius never actually exceeds ~484px regardless of viewport --
// forcing that same 0.42-of-container-width radius onto a 700-900px tablet
// container instead produces a radius nearly as large as desktop's inside
// a much smaller box, which is what was overlapping/cramming cards there.
// A smaller ratio (see also the narrower CARD_WIDTH_CLASS_TABLET below)
// keeps tablet reading as a proportionally scaled-down desktop fan.
const FAN_RADIUS_RATIO_PHONE = 0.85;
const FAN_RADIUS_RATIO_TABLET = 0.4;
const FAN_RADIUS_RATIO_DESKTOP = 0.42;
// CSS 3D perspective magnifies anything pushed toward the viewer by
// perspective/(perspective-z), which blows up as z (here, the front card's
// translateZ(radius)) approaches the perspective value itself -- this is
// what the height computation below corrects for. MAX_RADIUS_PX is only a
// defensive backstop against that blow-up if this component ever ends up
// in a container wider than max-w-6xl's 1152px cap (desktop's own radius,
// 0.42 * 1152 =~ 484px, sits comfortably under it and is never affected).
const PERSPECTIVE_PX = 1400;
const MAX_RADIUS_PX = 520;
// Two card-size tiers (not three): phone and desktop happen to share the
// same clamp() -- phone's container is narrow enough that 26vw never
// exceeds its 112px floor, and desktop's is exactly the size this clamp
// was originally tuned for. Tablet gets its own, smaller clamp so cards
// (and the gap between them) actually shrink for the smaller container
// instead of the same near-desktop-sized cards just getting more cramped.
const CARD_WIDTH_CLASS_DEFAULT = "w-[clamp(112px,26vw,190px)]";
const CARD_WIDTH_CLASS_TABLET = "w-[clamp(90px,16vw,150px)]";

function normalizeAngle(deg: number): number {
  const wrapped = ((deg % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

function Carousel3DCard({
  item,
  baseAngle,
  radius,
  rotateY,
  visibleHalfArc,
  fadeStart,
  widthClassName,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  item: Carousel3DItem;
  baseAngle: number;
  radius: number;
  rotateY: MotionValue<number>;
  visibleHalfArc: number;
  fadeStart: number;
  widthClassName: string;
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
    if (a >= visibleHalfArc) return 0;
    if (a <= fadeStart) return 1;
    const t = (a - fadeStart) / (visibleHalfArc - fadeStart);
    return 1 - t * 0.85;
  });
  const transform = useTransform(angleFromFront, (a) => {
    const t = Math.min(1, Math.max(0, (a - fadeStart) / (visibleHalfArc - fadeStart)));
    const scale = 1 - t * 0.22;
    return `translate(-50%, -50%) rotateY(${baseAngle}deg) translateZ(${radius}px) scale(${scale})`;
  });
  const pointerEvents = useTransform(angleFromFront, (a) => (a >= visibleHalfArc ? "none" : "auto"));
  // Native preserve-3d depth sorting (on the ring parent) only works for
  // fully-opaque children -- any card with opacity < 1 gets flattened out
  // of the 3D stacking context and painted in plain DOM order instead, so a
  // side card can end up drawn *over* the front card regardless of which is
  // actually nearer the viewer. That was the clipped-front-card/label-
  // behind-another-card glitch: every card but the exact front one animates
  // opacity, so DOM order (not depth) was deciding paint order. An explicit
  // z-index keyed off the same angleFromFront the depth math already uses
  // sidesteps the flattening bug entirely -- closer to dead-center always
  // wins, full stop.
  const zIndex = useTransform(angleFromFront, (a) => Math.round(1000 - Math.min(a, visibleHalfArc) * 10));

  return (
    <motion.div
      // Width-driven, height-from-aspect-ratio (not h-full off the
      // container) so the card reads as a near-square panel -- slightly
      // taller than wide -- instead of a tall portrait sliver, independent
      // of how tall the carousel's own container happens to be.
      className={cn(
        "absolute top-1/2 left-1/2 aspect-[4/5] cursor-grab touch-pan-y active:cursor-grabbing",
        widthClassName,
      )}
      style={{
        transform,
        opacity,
        pointerEvents,
        zIndex,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Same card language as WhoWeServeSection/GapSection/HowSportFoWorksSection
          -- white surface, orange top accent, stitch-card-lift hover-raise +
          stitch-card-image zoom -- rather than a bespoke dark overlay card. */}
      <div className="stitch-card-lift flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 border-t-4 border-t-stitch-orange bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-colors duration-300 will-change-transform hover:border-t-stitch-orange-hover">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            draggable={false}
            // Deliberately requested larger than the card ever renders (max
            // 190px): these cards live inside a 3D rotateY/scale transform,
            // and over-fetching resolution gives the browser's own
            // downsample pass more detail to work with than an exact-size
            // fetch would -- exact-size fetches were reading as soft/blurry
            // once transformed.
            sizes="280px"
            quality={90}
            className="stitch-card-image object-cover"
          />
        </div>
        <p className="shrink-0 px-1.5 py-1.5 text-center text-[9px] leading-tight font-bold tracking-wide text-stitch-navy uppercase sm:px-2 sm:py-2 sm:text-[11px]">
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
// How many cards deep (on each side of dead-center) stay visible at once,
// regardless of the ring's total item count -- see the VISIBLE_HALF_ARC
// comment above for why a fixed arc breaks down on rings with many items.
// Narrower containers (phones) get fewer cards-deep so each one stays large
// and legible instead of foreshortening into slivers; wider containers
// (tablet/desktop) can afford to fan more cards deep. Three tiers matching
// the site's own phone/tablet/desktop breakpoints (<400px, 400-1024px,
// >=1024px): a real phone width only has room for the active card plus a
// sliver of each neighbor before labels start mashing together, tablet can
// fit a full extra card each side, and only true desktop widths get the
// original 3-deep fan -- a tablet container forced into that same 3-deep
// fan (the old 640px cutoff put 768-1024px widths there) reads as crowded,
// same complaint as the old phone bug just less severe.
const CARDS_VISIBLE_EACH_SIDE_PHONE = 1;
const CARDS_VISIBLE_EACH_SIDE_TABLET = 2;
const CARDS_VISIBLE_EACH_SIDE_DESKTOP = 3;
// This is the carousel's own rendered container width, not the viewport --
// the section wraps it in px-4 side padding, so a real phone viewport
// (390-430px, even up to ~460-480px on the largest phones) already renders
// a container narrower than its viewport by ~32px. A 400px cutoff here
// meant anything from ~432px viewport up (still very much a phone, e.g.
// this 450px test width) fell through to the tablet tier -- whose radius
// ratio and card-size clamp were tuned for 700-900px containers -- and
// crammed into a ~420px one instead, reading as jumbled/overlapping cards
// rather than tablet's intended fan. Raised so all real single-column phone
// widths land on the phone tier that's already tuned and confirmed good.
const PHONE_CONTAINER_PX = 480;
const TABLET_CONTAINER_PX = 1024;

export function Carousel3D({ items, onSelect, className }: Carousel3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // An invisible, untransformed div wearing the exact same size classes as
  // a real card (see the probe render below) -- reading ITS box instead of
  // re-deriving the w-[clamp(...)] + aspect-[4/5] formula in JS keeps the
  // card's true size to one source of truth (the Tailwind classes
  // themselves), the same bug class as the container-height mismatch this
  // whole file just got bitten by. offsetWidth/Height specifically (not
  // getBoundingClientRect) because they reflect the *layout* box, which
  // transforms (the real cards' rotateY/translateZ/scale) never touch.
  const cardProbeRef = useRef<HTMLDivElement | null>(null);
  const rotateY = useMotionValue(0);
  const [radius, setRadius] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  // The height this carousel actually needs to show its (perspective-
  // magnified, see MAX_RADIUS_PX above) front card without clipping it --
  // computed from the live probe + radius rather than guessed once and
  // left to drift out of sync with the sizing classes above.
  const [computedHeight, setComputedHeight] = useState(0);
  const angleStep = items.length > 0 ? 360 / items.length : 0;
  const isTablet = containerWidth >= PHONE_CONTAINER_PX && containerWidth < TABLET_CONTAINER_PX;
  const cardsVisibleEachSide =
    containerWidth <= 0
      ? CARDS_VISIBLE_EACH_SIDE_DESKTOP
      : containerWidth < PHONE_CONTAINER_PX
        ? CARDS_VISIBLE_EACH_SIDE_PHONE
        : isTablet
          ? CARDS_VISIBLE_EACH_SIDE_TABLET
          : CARDS_VISIBLE_EACH_SIDE_DESKTOP;
  const widthClassName = isTablet ? CARD_WIDTH_CLASS_TABLET : CARD_WIDTH_CLASS_DEFAULT;
  // Caps, not floors/replacements: a ring with few items (wide angleStep)
  // still lands on the original 150/90 constants via the Math.min.
  const visibleHalfArc = Math.min(VISIBLE_HALF_ARC, angleStep * (cardsVisibleEachSide + 0.5));
  const fadeStart = Math.min(FADE_START, angleStep * (cardsVisibleEachSide - 0.5));

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
        const ratio =
          w < PHONE_CONTAINER_PX
            ? FAN_RADIUS_RATIO_PHONE
            : w < TABLET_CONTAINER_PX
              ? FAN_RADIUS_RATIO_TABLET
              : FAN_RADIUS_RATIO_DESKTOP;
        setRadius(Math.min(Math.round(w * ratio), MAX_RADIUS_PX));
        setContainerWidth(w);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Separate from the measurement above on purpose: widthClassName (and so
  // the probe's actual rendered size) only updates once React commits the
  // re-render that `setContainerWidth` above triggers, one tick after
  // `radius` is set -- reading the probe inside the same effect as
  // `measure()` would read its *previous* tier's size instead (e.g. still
  // desktop-sized on the very first tablet measurement). Depending on
  // `widthClassName` here guarantees this always runs after that class has
  // actually landed in the DOM.
  useEffect(() => {
    const probe = cardProbeRef.current;
    if (!probe || radius <= 0) return;
    const magnification = PERSPECTIVE_PX / (PERSPECTIVE_PX - radius);
    // +8px of headroom for the card's own border/shadow rounding.
    setComputedHeight(Math.ceil(probe.offsetHeight * magnification) + 8);
  }, [radius, widthClassName]);

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
      style={computedHeight > 0 ? { height: computedHeight } : undefined}
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        if (!dragRef.current) pausedRef.current = false;
      }}
    >
      {/* Same size classes as a real card, kept off-transform and
          invisible -- exists purely so `measure()` above can read its
          offsetHeight as the card's true intrinsic (untransformed) size.
          See computedHeight's declaration for why that beats re-deriving
          the clamp()/aspect-ratio formula a second time in JS. */}
      <div ref={cardProbeRef} aria-hidden className={cn("invisible absolute aspect-[4/5]", widthClassName)} />
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
            visibleHalfArc={visibleHalfArc}
            fadeStart={fadeStart}
            widthClassName={widthClassName}
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
