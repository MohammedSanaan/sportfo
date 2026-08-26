interface KpiCardsProps {
  today: number;
  week: number;
  month: number;
  year: number;
  labels: { today: string; week: string; month: string; year: string };
}

// Fixed periods, always computed in Asia/Kolkata by admin_registration_kpis
// -- unaffected by the TIME RANGE filter below, which only scopes the
// trend/breakdown/table.
export function KpiCards({ today, week, month, year, labels }: KpiCardsProps) {
  const cards = [
    { label: labels.today, value: today },
    { label: labels.week, value: week },
    { label: labels.month, value: month },
    { label: labels.year, value: year },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm"
        >
          <p className="text-xs font-semibold tracking-wide text-ink-400 uppercase">{card.label}</p>
          <p className="mt-2 text-3xl font-bold text-ink-900">{card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
