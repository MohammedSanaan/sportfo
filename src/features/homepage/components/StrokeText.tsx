"use client";

import { CSSProperties, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./StrokeText.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Tailored to one exact heading -- the hero/Discovery transition band's
 * "SportFo / Talent deserves to be discovered." -- not a generic reusable
 * text-effect component. Sizes and colors default to match the Display/
 * SpecLabel primitives this replaces (see HeroDiscoveryBreak.tsx) rather
 * than the original demo's much larger display-type defaults, so the
 * section's footprint doesn't grow.
 *
 * A single scroll-triggered draw-then-fill pass (ScrollTrigger `once: true`
 * -- never loops, stays static once finished); `prefers-reduced-motion`
 * skips straight to the finished state, matching every other entrance
 * animation on this page (see Reveal.tsx).
 */
export function StrokeText({
  eyebrow = "SportFo",
  line1 = "Talent deserves to be",
  line2 = "discovered.",

  strokeColor = "var(--color-brand-300)",
  fillColor = "var(--color-ink-900)",
  accentColor = "var(--color-brand-700)",

  strokeWidth = 1,
  drawDuration = 1,
  fillDelay = 0.05,
  stagger = 0.08,
  ease = "power2.out",

  fontSize = 32,
  eyebrowSize = 11,
  fontWeight = 600,
  letterSpacing = -0.9,

  className = "",
}: {
  eyebrow?: string;
  line1?: string;
  line2?: string;
  strokeColor?: string;
  fillColor?: string;
  accentColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  fontSize?: number;
  eyebrowSize?: number;
  fontWeight?: number | string;
  letterSpacing?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const line1MeasureRef = useRef<SVGTextElement | null>(null);

  const strokeRefs = useRef<SVGTextElement[]>([]);
  const fillRefs = useRef<SVGTextElement[]>([]);
  const wipeRef = useRef<SVGRectElement | null>(null);

  const [box, setBox] = useState<TextBox | null>(null);
  // Line 2 ("discovered.") centers under line 1 rather than sharing its
  // left edge -- needs line 1's own rendered width, not the combined
  // group's, since line 1 is wider and defines the block's x=0 origin.
  const [line1Width, setLine1Width] = useState<number | null>(null);

  const rawId = useId();
  const wipeId = `sportfo-stroke-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const fontStyle: CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight,
    letterSpacing: `${letterSpacing}px`,
    fontFamily: "var(--font-sans)",
  };

  const italicFontStyle: CSSProperties = {
    ...fontStyle,
    fontFamily: "var(--font-display)",
    fontStyle: "italic",
    fontWeight: 400,
  };

  // Measures the rendered text so the SVG viewBox hugs it exactly, instead
  // of the large fixed canvas the original demo component used.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      try {
        const line1El = line1MeasureRef.current;
        if (line1El) {
          const line1Box = line1El.getBBox();
          if (line1Box.width) {
            setLine1Width((prev) =>
              prev !== null && Math.abs(prev - line1Box.width) < 0.5 ? prev : line1Box.width,
            );
          }
        }

        const bbox = svg.getBBox();
        if (!bbox || !bbox.width || !bbox.height) return;
        const padding = Math.max(3, strokeWidth * 2);
        const next = {
          x: bbox.x - padding,
          y: bbox.y - padding,
          width: bbox.width + padding * 2,
          height: bbox.height + padding * 2,
        };
        // ResizeObserver fires once immediately on observe(), and
        // fonts.ready can resolve a moment after the layout-effect's own
        // synchronous measure -- both produce a near-identical box. Setting
        // state with a new object every time would re-run the animation
        // effect below and tear down/rebuild the ScrollTrigger each time,
        // which can miss the "entered viewport" crossing entirely if that
        // rebuild happens after the page has already scrolled past it.
        setBox((prev) =>
          prev &&
          Math.abs(prev.x - next.x) < 0.5 &&
          Math.abs(prev.y - next.y) < 0.5 &&
          Math.abs(prev.width - next.width) < 0.5 &&
          Math.abs(prev.height - next.height) < 0.5
            ? prev
            : next,
        );
      } catch {
        // Not measurable yet on the very first paint.
      }
    };

    measure();

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(svg);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [eyebrow, line1, line2, fontSize, fontWeight, letterSpacing, strokeWidth]);

  useEffect(() => {
    const root = rootRef.current;
    if (typeof window === "undefined" || !root || !box) return undefined;

    const strokes = strokeRefs.current.filter(Boolean);
    const fills = fillRefs.current.filter(Boolean);
    const wipe = wipeRef.current;
    if (!strokes.length || !fills.length) return undefined;

    const dash = Math.max(fontSize * 7, 220);
    const fillDuration = Math.max(0.3, drawDuration * 0.4);
    const targets = [...strokes, ...fills, wipe].filter(Boolean);

    const setEnd = () => {
      gsap.killTweensOf(targets);
      gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 });
      gsap.set(fills, { opacity: 1 });
      if (wipe) gsap.set(wipe, { attr: { width: box.width } });
    };

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setEnd();
      return () => {
        gsap.killTweensOf(targets);
      };
    }

    gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash });
    gsap.set(fills, { opacity: 1 });
    if (wipe) gsap.set(wipe, { attr: { width: 0 } });

    const timeline = gsap.timeline({ paused: true });
    timeline.to(
      strokes,
      { strokeDashoffset: 0, duration: drawDuration, ease, stagger },
      0,
    );
    if (wipe) {
      timeline.to(
        wipe,
        { attr: { width: box.width }, duration: fillDuration, ease: "power2.inOut" },
        drawDuration + fillDelay,
      );
    }

    // Plays once, the first time the section enters the viewport, and never
    // again -- no loop, no replay on subsequent scrolls.
    const scrollTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top 82%",
      once: true,
      onEnter: () => timeline.play(0),
    });

    return () => {
      scrollTrigger.kill();
      timeline.kill();
      gsap.killTweensOf(targets);
    };
  }, [box, fontSize, drawDuration, fillDelay, stagger, ease]);

  const viewBox = box
    ? `${box.x} ${box.y} ${box.width} ${box.height}`
    : `0 0 400 ${fontSize * 2.2}`;

  return (
    <div ref={rootRef} className={`sportfo-stroke-text ${className}`.trim()}>
      <div
        className="sportfo-stroke-text__eyebrow"
        style={{ color: accentColor, fontSize: `${eyebrowSize}px` }}
      >
        <span className="sportfo-stroke-text__eyebrow-line" />
        <span>{eyebrow}</span>
      </div>

      <svg
        ref={svgRef}
        className="sportfo-stroke-text__svg"
        viewBox={viewBox}
        // Explicit intrinsic size, matching the viewBox 1:1 -- without
        // this an <svg> with only a viewBox has no intrinsic size to fall
        // back on, and a replaced element in that state stretches to fill
        // its container (CSS sizing spec), not to its natural content
        // size. width:auto + max-width:100% in the stylesheet then scales
        // this down proportionally only on a narrow viewport.
        width={box ? box.width : 400}
        height={box ? box.height : fontSize * 2.2}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {box && (
          <defs>
            <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
              <rect ref={wipeRef} x={box.x} y={box.y} width="0" height={box.height} />
            </clipPath>
          </defs>
        )}

        <text
          ref={(el) => {
            if (el) strokeRefs.current[0] = el;
          }}
          x="0"
          y={fontSize}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={fontStyle}
        >
          {line1}
        </text>
        <text
          ref={(el) => {
            if (el) {
              fillRefs.current[0] = el;
              line1MeasureRef.current = el;
            }
          }}
          x="0"
          y={fontSize}
          fill={fillColor}
          stroke="none"
          style={fontStyle}
          clipPath={box ? `url(#${wipeId})` : undefined}
        >
          {line1}
        </text>

        <text
          ref={(el) => {
            if (el) strokeRefs.current[1] = el;
          }}
          x={line1Width !== null ? line1Width / 2 : "0"}
          y={fontSize * 2.05}
          textAnchor={line1Width !== null ? "middle" : "start"}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={italicFontStyle}
        >
          {line2}
        </text>
        <text
          ref={(el) => {
            if (el) fillRefs.current[1] = el;
          }}
          x={line1Width !== null ? line1Width / 2 : "0"}
          y={fontSize * 2.05}
          textAnchor={line1Width !== null ? "middle" : "start"}
          fill={fillColor}
          stroke="none"
          style={italicFontStyle}
          clipPath={box ? `url(#${wipeId})` : undefined}
        >
          {line2}
        </text>
      </svg>
    </div>
  );
}

export default StrokeText;
