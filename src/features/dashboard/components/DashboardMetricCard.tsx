import Link from "next/link";
import type { ReactNode } from "react";

interface DashboardMetricCardProps {
  label: string;
  value: number;
  helperText: string;
  actionLabel?: string;
  actionHref?: string;
  /** Demo-mode-only CTA (a DemoOnlyButton) rendered instead of the real
   *  actionLabel/actionHref Link. See MetricCardsRow. */
  footer?: ReactNode;
  accent: "blue" | "orange" | "pink";
  icon: ReactNode;
}

const ACCENT_STYLES: Record<DashboardMetricCardProps["accent"], { card: string; dot: string; link: string }> = {
  blue: {
    card: "bg-brand-50/60 border-brand-200",
    dot: "bg-brand-600",
    link: "text-brand-700 hover:text-brand-800",
  },
  orange: {
    card: "bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
    link: "text-amber-700 hover:text-amber-800",
  },
  pink: {
    card: "bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
    link: "text-rose-700 hover:text-rose-800",
  },
};

// One of the three "Active Sponsorships / Upcoming Trials / Academy
// Invites" cards -- always renders a real value (0 today, since SportFo
// has no sponsorship/trial/invite backend yet) plus honest empty-state
// copy, never the reference design's hardcoded 3/2/1.
export function DashboardMetricCard({
  label,
  value,
  helperText,
  actionLabel,
  actionHref,
  footer,
  accent,
  icon,
}: DashboardMetricCardProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className={`rounded-2xl border p-5 ${styles.card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-ink-500 uppercase">
          {icon}
          {label}
        </div>
        <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />
      </div>
      <div className="mt-3 text-4xl font-extrabold leading-none text-ink-900 sm:text-[46px]">
        {value}
      </div>
      <p className="mt-1.5 text-sm text-ink-500">{helperText}</p>
      {footer}
      {!footer && actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={`mt-4 inline-block text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${styles.link}`}
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
