import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The homepage's shared vocabulary.
 *
 * Every section is assembled from these four marks, which is what keeps a
 * page of very different layouts reading as one designed system:
 *
 *   SpecLabel  — the letterspaced caption with a leading rule
 *   Index      — the 01/02 numeral lifted from lane and jersey numbering
 *   Display    — headline scale, with the serif italic accent
 *   Container  — the shared gutter and measure
 */

// `onImage` is the variant for captions sitting directly on photography,
// where the backdrop is unpredictable and only full white holds contrast.
const SPEC_TONES = {
  dark: { text: "text-brand-700", rule: "bg-brand-300" },
  light: { text: "text-steel-300", rule: "bg-steel-500" },
  onImage: { text: "text-white", rule: "bg-white/70" },
} as const;

export function SpecLabel({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof SPEC_TONES;
  className?: string;
}) {
  const t = SPEC_TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 whitespace-nowrap text-[11px] font-semibold tracking-[0.18em] uppercase",
        t.text,
        className,
      )}
    >
      <span aria-hidden className={cn("h-px w-6", t.rule)} />
      {children}
    </span>
  );
}

const INDEX_TONES = {
  dark: "text-ink-400",
  light: "text-steel-400",
  onImage: "text-white/70",
} as const;

export function Index({
  value,
  tone = "dark",
  className,
}: {
  value: number | string;
  tone?: keyof typeof INDEX_TONES;
  className?: string;
}) {
  const text = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return (
    <span
      aria-hidden
      className={cn(
        "font-mono text-[11px] font-medium tracking-[0.12em] tabular-nums",
        INDEX_TONES[tone],
        className,
      )}
    >
      {text}
    </span>
  );
}

/**
 * Headline. `accent` renders in the display serif italic — one word, at most
 * two, and only at display sizes where the contrast reads as intentional.
 */
export function Display({
  children,
  accent,
  after,
  tone = "dark",
  size = "md",
  as: Tag = "h2",
  className,
}: {
  children?: ReactNode;
  accent?: string;
  after?: ReactNode;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "xl";
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  const sizes = {
    sm: "text-[1.75rem] sm:text-[2rem] leading-[1.12]",
    md: "text-[2rem] sm:text-[2.6rem] leading-[1.08]",
    lg: "text-[2.4rem] sm:text-[3.2rem] lg:text-[3.75rem] leading-[1.04]",
    xl: "text-[2.75rem] sm:text-[4rem] lg:text-[5.25rem] leading-[0.98]",
  };
  return (
    <Tag
      className={cn(
        "font-semibold tracking-[-0.028em] text-balance",
        sizes[size],
        tone === "light" ? "text-white" : "text-ink-900",
        className,
      )}
    >
      {children}
      {accent && (
        <>
          {children ? " " : ""}
          <span className="font-display font-normal italic tracking-[-0.01em]">
            {accent}
          </span>
        </>
      )}
      {after}
    </Tag>
  );
}

/** Consistent page gutter + measure for every section. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[78rem] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}
