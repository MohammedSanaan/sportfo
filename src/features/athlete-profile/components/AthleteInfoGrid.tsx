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
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border-default bg-border-default sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-2 items-center gap-4 bg-surface px-4 py-3">
          {/* grid-cols-2 (not flex): each column is `minmax(0, 1fr)`, a hard
              50% cap neither side can be pushed past -- a long label wraps
              onto a second line within its own half instead of shrinking
              (or fully collapsing) the value column next to it. */}
          <dt className="min-w-0 text-xs font-medium tracking-wide text-ink-500 uppercase">{item.label}</dt>
          <dd className="min-w-0 truncate text-right text-sm font-medium text-ink-900">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
