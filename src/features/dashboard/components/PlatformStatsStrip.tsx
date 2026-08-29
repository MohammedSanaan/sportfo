interface PlatformStatsStripCounts {
  athletes: number | string;
  academies: number | string;
  sponsors: number | string;
}

interface PlatformStatsStripProps {
  counts: PlatformStatsStripCounts;
  t: (key: string) => string;
}

// Real submitted-registration counts (see get_public_registration_counts,
// a count-only SECURITY DEFINER RPC -- no per-row data is ever exposed),
// replacing the reference design's hardcoded "5,000+ / 120+ / 150+".
// Hidden entirely by the caller when the count RPC fails, rather than ever
// showing a fabricated fallback number -- UNLESS dev/demo mode is on, in
// which case the caller (AthleteDashboard) passes the fixed demo strings
// from demo-dashboard.ts instead of the real numeric counts, which is the
// only reason `counts` accepts strings here at all.
export function PlatformStatsStrip({ counts, t }: PlatformStatsStripProps) {
  const items = [
    { value: counts.athletes, label: t("dashboard.platformStats.athletes") },
    { value: counts.academies, label: t("dashboard.platformStats.academies") },
    { value: counts.sponsors, label: t("dashboard.platformStats.sponsors") },
  ];

  return (
    <section className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#4d7cff]/12 to-[#ff2f6d]/10 sm:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={
            index < items.length - 1
              ? "border-b border-white/[0.08] px-6 py-5 sm:border-r sm:border-b-0"
              : "px-6 py-5"
          }
        >
          <div className="text-[34px] leading-none font-extrabold text-[#e8ecf8]">{item.value}</div>
          <div className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-[#9aa5c6] uppercase">
            {item.label}
          </div>
        </div>
      ))}
    </section>
  );
}
