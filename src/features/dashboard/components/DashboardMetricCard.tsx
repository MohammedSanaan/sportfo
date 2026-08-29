import Link from "next/link";
import type { ReactNode } from "react";

interface DashboardMetricCardProps {
  label: string;
  value: number;
  helperText: string;
  actionLabel?: string;
  actionHref?: string;
  accent: "blue" | "orange" | "pink";
  icon: ReactNode;
}

const ACCENT_STYLES: Record<DashboardMetricCardProps["accent"], { card: string; dot: string; link: string }> = {
  blue: {
    card: "bg-gradient-to-br from-[#4d7cff]/18 to-[#0d1430] border-[#4d7cff]/30",
    dot: "bg-[#4d7cff]",
    link: "text-[#7ea3ff] hover:text-[#a9c1ff]",
  },
  orange: {
    card: "bg-gradient-to-br from-[#ffb020]/16 to-[#0d1430] border-[#ffb020]/30",
    dot: "bg-[#ffb020]",
    link: "text-[#ffc457] hover:text-[#ffd992]",
  },
  pink: {
    card: "bg-gradient-to-br from-[#ff2f6d]/16 to-[#0d1430] border-[#ff2f6d]/30",
    dot: "bg-[#ff2f6d]",
    link: "text-[#ff7fa4] hover:text-[#ffb0c7]",
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
  accent,
  icon,
}: DashboardMetricCardProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className={`rounded-2xl border p-5 ${styles.card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-[#9fb0e0] uppercase">
          {icon}
          {label}
        </div>
        <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />
      </div>
      <div className="mt-3 text-4xl font-extrabold leading-none text-[#e8ecf8] sm:text-[46px]">
        {value}
      </div>
      <p className="mt-1.5 text-sm text-[#96a2c4]">{helperText}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className={`mt-4 inline-block text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1430] ${styles.link}`}
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}
