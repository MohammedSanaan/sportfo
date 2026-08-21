"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up once, when it first scrolls into view -- not on every render.
 * Used only where real or clearly-labelled demo data already exists (the
 * hero's network stats); never to animate an invented number.
 */
export function AnimatedStat({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={className}>
      <NumberFlow value={shown ? value : 0} trend={1} />
    </span>
  );
}
