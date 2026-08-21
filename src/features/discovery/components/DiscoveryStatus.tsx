import Link from "next/link";

type DiscoveryStatusVariant = "error" | "no-athletes" | "no-matches" | "out-of-range";

interface DiscoveryStatusProps {
  variant: DiscoveryStatusVariant;
}

const COPY: Record<DiscoveryStatusVariant, string> = {
  error: "We couldn't load athletes right now. Please try again.",
  "no-athletes": "More athletes are joining SportFo soon.",
  "no-matches": "No athletes match your search.",
  "out-of-range": "You've gone past the last page of results.",
};

const LINK_LABEL: Partial<Record<DiscoveryStatusVariant, string>> = {
  error: "Try again",
  "no-matches": "Clear filters",
  "out-of-range": "Back to first page",
};

export function DiscoveryStatus({ variant }: DiscoveryStatusProps) {
  const linkLabel = LINK_LABEL[variant];

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <p className="text-sm text-ink-500">{COPY[variant]}</p>
      {linkLabel && (
        <Link
          href="/athletes"
          className="text-sm font-medium text-brand-700 underline hover:text-brand-800"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
