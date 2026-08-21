import { cn } from "@/lib/cn";

interface SportsIconPatternProps {
  className?: string;
}

// A very restrained, low-opacity repeating texture of simple sport-icon
// silhouettes (ball, trophy, star/medal) -- pure decorative background,
// never content. Uses currentColor so the caller controls tint via a text
// color class, and is expected to be paired with a low opacity utility
// (e.g. "text-brand-600 opacity-[0.06]") on the className passed in.
// Must sit behind real content (absolute + a lower stacking position, or
// simply first in DOM order under a `relative` content wrapper) and never
// intercepts pointer events.
export function SportsIconPattern({ className }: SportsIconPatternProps) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="sportfo-icon-pattern"
          width="140"
          height="140"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(8)"
        >
          {/* ball */}
          <g transform="translate(14,18)" stroke="currentColor" strokeWidth="1.5" fill="none">
            <circle cx="12" cy="12" r="11" />
            <path d="M12 4 L17 8.5 L15 15 L9 15 L7 8.5 Z" />
            <path d="M12 4V1M17 8.5l3-1.5M15 15l2 3M9 15l-2 3M7 8.5l-3-1.5" />
          </g>
          {/* trophy */}
          <g transform="translate(82,72)" stroke="currentColor" strokeWidth="1.5" fill="none">
            <path d="M7 2h12v6a6 6 0 0 1-12 0V2Z" />
            <path d="M7 4H3a4 4 0 0 0 4 6M19 4h4a4 4 0 0 1-4 6" />
            <path d="M13 14v4M9 22h8M10 18h6l1 4H9l1-4Z" />
          </g>
          {/* star */}
          <g transform="translate(38,92)" stroke="currentColor" strokeWidth="1.5" fill="none">
            <path d="M11 1.5l2.6 5.6L20 8l-4.3 4.3 1 5.9L11 15.6 5.3 18.2l1-5.9L2 8l6.4-.9L11 1.5Z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sportfo-icon-pattern)" />
    </svg>
  );
}
