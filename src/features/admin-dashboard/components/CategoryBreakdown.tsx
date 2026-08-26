interface BreakdownItem {
  registrationType: string;
  label: string;
  count: number;
}

interface CategoryBreakdownProps {
  items: BreakdownItem[];
  title: string;
  emptyLabel: string;
}

// Every value comes straight from admin_category_breakdown (a live COUNT
// grouped in Postgres) -- no mock numbers, no client-side aggregation.
export function CategoryBreakdown({ items, title, emptyLabel }: CategoryBreakdownProps) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-8 mb-8 text-center text-sm text-ink-400">{emptyLabel}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.registrationType} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-ink-700 sm:w-40">{item.label}</span>
              <div className="h-2 min-w-0 flex-1 rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-brand-500"
                  style={{ width: `${Math.max((item.count / max) * 100, item.count > 0 ? 2 : 0)}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-semibold text-ink-900">
                {item.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
