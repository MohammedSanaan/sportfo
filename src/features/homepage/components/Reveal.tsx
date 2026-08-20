"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Reveals its children once, when they first scroll into view.
 *
 * Opacity/transform only so it never triggers layout, and the CSS in
 * globals.css disables it outright under prefers-reduced-motion. With
 * scripting off the effect never runs, so a <noscript> rule in globals.css
 * paints every reveal visible rather than leaving the page blank.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={delay ? ({ "--sf-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn("sf-reveal", className)}
    >
      {children}
    </Tag>
  );
}
