interface AthleteInfoItem {
  label: string;
  value: string;
}

interface AthleteInfoGridProps {
  items: AthleteInfoItem[];
}

// A semantic key/value list (a real <dl>, not a misused <table>) -- one
// field per row at every viewport width, thin 1px dividers via the
// gap-px/bg trick. Replaces the old cramped DetailField mini-card grid for
// the owner profile page only; DetailField itself is untouched (still used
// by the public profile).
//
// Deliberately single-column, never a responsive `sm:grid-cols-2` split:
// every caller (AthletePersonalInfo, AthleteSportsSection,
// AthleteEmploymentSection, AthleteApparelSection) already renders inside
// the profile page's own `lg:grid-cols-2` card layout (Personal Info next
// to Sports Info, Employment next to Apparel) -- a plain Tailwind
// viewport-width breakpoint here has no way to know its own container is
// already half the page, so a `sm:` (640px) split re-triggered on top of
// that `lg:` (1024px) split doubly squeezed every cell into roughly a
// quarter of the page width from 1024px up, the exact range that kept
// cutting values short even after truncate/overflow-hidden were removed.
// Single-column gives every field the card's *full* width at every size.
//
// Label sits ABOVE its value (not side-by-side) so a long label (e.g.
// "Sport Discipline / Position / Role") never has to fight a long value
// for space on one line. Never use truncate/overflow-hidden/
// whitespace-nowrap here: min-w-0 + break-words + whitespace-normal let
// every value wrap and grow the row instead of being clipped.
export function AthleteInfoGrid({ items }: AthleteInfoGridProps) {
  return (
    <dl className="flex flex-col gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-1 bg-[#0d1430] px-4 py-3">
          <dt className="min-w-0 text-xs font-medium tracking-wide text-[#8b96b8] uppercase">{item.label}</dt>
          <dd className="min-w-0 text-sm leading-relaxed font-medium whitespace-normal break-words text-[#e8ecf8]">
            {item.value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
