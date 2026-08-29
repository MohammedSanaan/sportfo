import type { DashboardDemoData } from "../data/demo-dashboard";

interface MyStatsCardProps {
  profileStrengthPercentage: number;
  achievementsCount: number;
  verifiedCount: number;
  t: (key: string) => string;
  /** DEV/DEMO ONLY -- see demo-dashboard.ts. Undefined outside demo mode. */
  demo?: DashboardDemoData["myStats"];
}

// Replaces the reference design's "8.2K Followers / #7 Rank / 45 Medals"
// (no followers or ranking system exists in SportFo) with the three real
// metrics available: profile completeness, total achievements added, and
// how many of those are admin-verified -- UNLESS `demo` is provided (only
// in dev/demo mode), in which case the reference design's own three demo
// numbers are shown instead, purely for visual filler; they are never
// claimed to be database-backed.
export function MyStatsCard({ profileStrengthPercentage, achievementsCount, verifiedCount, t, demo }: MyStatsCardProps) {
  const stats = demo
    ? [
        { value: demo.followers, label: t("dashboard.myStats.followers"), color: "text-[#e8ecf8]" },
        { value: demo.rank, label: t("dashboard.myStats.rank"), color: "text-[#7ea3ff]" },
        { value: demo.medals, label: t("dashboard.myStats.medals"), color: "text-[#ffb020]" },
      ]
    : [
        { value: `${profileStrengthPercentage}%`, label: t("dashboard.stats.profile"), color: "text-[#e8ecf8]" },
        { value: String(achievementsCount), label: t("dashboard.stats.achievements"), color: "text-[#7ea3ff]" },
        { value: String(verifiedCount), label: t("dashboard.stats.verified"), color: "text-[#ffb020]" },
      ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1430]">
      <div className="border-b border-white/[0.08] px-[18px] py-3.5 text-base font-bold text-[#e8ecf8]">
        {t("dashboard.myStats.title")}
      </div>
      <div className="grid grid-cols-3 px-2.5 py-4 text-center">
        {stats.map((stat, index) => (
          <div key={stat.label} className={index > 0 ? "border-l border-white/[0.08]" : undefined}>
            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="mt-1 text-xs text-[#8b96b8]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
