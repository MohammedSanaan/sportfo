import Link from "next/link";
import type { ProfileStrength } from "@/lib/athlete/profile-strength";

interface DashboardProfileStrengthCardProps {
  strength: ProfileStrength;
  t: (key: string) => string;
}

// The compact sidebar version of profile strength -- same calculation as
// the full /athlete/profile page (calculateProfileStrength, computed once
// server-side in get-athlete-dashboard.ts and passed down, never
// recomputed here), just a smaller card. The "next step" line is the
// first incomplete checklist item's own label (real, not a fabricated
// recommendation like the reference design's "Add 2 match videos...").
export function DashboardProfileStrengthCard({ strength, t }: DashboardProfileStrengthCardProps) {
  const nextItem = strength.items.find((item) => !item.complete);

  return (
    <div className="rounded-2xl border border-border-default bg-gradient-to-br from-brand-50 to-rose-50 p-[18px]">
      <div className="font-mono text-[10px] tracking-[0.12em] text-ink-500 uppercase">
        {t("dashboard.profileStrength.label")}
      </div>
      <div className="my-1.5 text-[30px] leading-none font-extrabold text-ink-900">
        {strength.percentage}%
      </div>
      <div
        role="progressbar"
        aria-valuenow={strength.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("dashboard.profileStrength.label")}
        className="h-1.5 overflow-hidden rounded-full bg-white"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-rose-500 transition-all duration-300"
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      {nextItem ? (
        <Link
          href={nextItem.href}
          className="mt-2.5 flex items-center gap-1 text-[13px] font-medium text-ink-600 underline-offset-2 transition-colors hover:text-ink-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {nextItem.label}
          <span aria-hidden>&rarr;</span>
        </Link>
      ) : (
        <p className="mt-2.5 text-[13px] text-ink-500">{t("dashboard.profileStrength.complete")}</p>
      )}
    </div>
  );
}
