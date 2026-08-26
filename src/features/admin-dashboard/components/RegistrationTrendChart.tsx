interface TrendPoint {
  day: string;
  registrations: number;
}

interface RegistrationTrendChartProps {
  data: TrendPoint[];
  title: string;
  emptyLabel: string;
}

// A deliberately lightweight inline-SVG line/area chart -- no charting
// library in the project and this is the only chart the dashboard needs,
// so pulling one in wasn't justified. Works the same way whether the
// selected range is 1 day or 366 (Today vs This Year): a continuous path
// scales to any point count without per-point labels crowding the axis.
export function RegistrationTrendChart({ data, title, emptyLabel }: RegistrationTrendChartProps) {
  const width = 100;
  const height = 36;

  const hasData = data.length > 0 && data.some((point) => point.registrations > 0);

  const max = Math.max(1, ...data.map((point) => point.registrations));
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const coords = data.map((point, index) => {
    const x = data.length > 1 ? index * stepX : width / 2;
    const y = height - (point.registrations / max) * (height - 4) - 2;
    return { x, y };
  });
  const linePath = coords.map((c) => `${c.x},${c.y}`).join(" L ");
  const areaPath = `M0,${height} L ${linePath} L ${width},${height} Z`;

  const midIndex = Math.floor(data.length / 2);

  return (
    <div className="rounded-2xl border border-border-default bg-surface p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>

      {!hasData ? (
        <p className="mt-8 mb-8 text-center text-sm text-ink-400">{emptyLabel}</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="mt-4 h-40 w-full overflow-visible"
            aria-hidden
          >
            <path d={areaPath} fill="var(--color-brand-100)" opacity={0.7} />
            <path
              d={`M ${linePath}`}
              fill="none"
              stroke="var(--color-brand-600)"
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-ink-400">
            <span>{data[0]?.day}</span>
            {data.length > 2 && <span>{data[midIndex]?.day}</span>}
            <span>{data[data.length - 1]?.day}</span>
          </div>
        </>
      )}
    </div>
  );
}
