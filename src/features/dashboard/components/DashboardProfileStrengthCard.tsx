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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#4d7cff]/16 to-[#ff2f6d]/12 p-[18px]">
      <div className="font-mono text-[10px] tracking-[0.12em] text-[#9fb0e0] uppercase">
        {t("dashboard.profileStrength.label")}
      </div>
      <div className="my-1.5 text-[30px] leading-none font-extrabold text-[#e8ecf8]">
        {strength.percentage}%
      </div>
      <div
        role="progressbar"
        aria-valuenow={strength.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("dashboard.profileStrength.label")}
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4d7cff] to-[#ff2f6d] transition-all duration-300"
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      <p className="mt-2.5 text-[13px] text-[#9aa5c6]">
        {nextItem ? nextItem.label : t("dashboard.profileStrength.complete")}
      </p>
    </div>
  );
}
