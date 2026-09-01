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
//
// Label sits ABOVE its value (not side-by-side) precisely so a long label
// (e.g. "Sport Discipline / Position / Role") never has to fight a long
// value for space in one narrow half-width cell -- that horizontal
// squeeze is what previously forced `truncate` and cut real profile data
// off with "...". Never use truncate/overflow-hidden/whitespace-nowrap
// here: min-w-0 + break-words + whitespace-normal let every value wrap
// and grow the cell instead of being clipped.
export function AthleteInfoGrid({ items }: AthleteInfoGridProps) {
  return (
    <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-1 bg-[#0d1430] px-4 py-3">
          <dt className="min-w-0 text-xs font-medium tracking-wide text-[#8b96b8] uppercase">{item.label}</dt>
          <dd className="min-w-0 text-sm font-medium whitespace-normal break-words text-[#e8ecf8]">
            {item.value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
