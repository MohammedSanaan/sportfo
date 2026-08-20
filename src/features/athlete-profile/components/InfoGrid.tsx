interface InfoItem {
  label: string;
  value: string | null | undefined;
}

interface InfoGridProps {
  items: InfoItem[];
}

// Shared read-only "label over value" grid used by every profile section
// below the header. Items with no value are skipped entirely rather than
// rendered as an empty/dash field -- a profile is filled in incrementally,
// so blank rows would just be noise.
export function InfoGrid({ items }: InfoGridProps) {
  const visible = items.filter((item) => item.value);

  if (visible.length === 0) {
    return <p className="text-sm text-ink-400">Nothing added yet.</p>;
  }

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {visible.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-400">
            {item.label}
          </dt>
          <dd className="text-sm text-ink-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
