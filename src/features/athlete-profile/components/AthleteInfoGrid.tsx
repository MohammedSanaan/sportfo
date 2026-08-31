interface AthleteInfoItem {
  label: string;
  value: string;
}

interface AthleteInfoGridProps {
  items: AthleteInfoItem[];
}

// A semantic key/value grid (a real <dl>, not a misused <table>) -- two
// columns on desktop, one per row on mobile, thin 1px dividers via the
// gap-px/bg trick. Replaces the old cramped DetailField mini-card grid for
// the owner profile page only; DetailField itself is untouched (still used
// by the public profile).
export function AthleteInfoGrid({ items }: AthleteInfoGridProps) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4 bg-[#0d1430] px-4 py-3">
          <dt className="shrink-0 text-xs font-medium tracking-wide text-[#8b96b8] uppercase">{item.label}</dt>
          <dd className="truncate text-right text-sm font-medium text-[#e8ecf8]">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
