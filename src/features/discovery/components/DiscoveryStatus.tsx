import Link from "next/link";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

type DiscoveryStatusVariant = "error" | "no-athletes" | "no-matches" | "out-of-range";

interface DiscoveryStatusProps {
  variant: DiscoveryStatusVariant;
  locale: Locale;
}

const COPY_KEY: Record<DiscoveryStatusVariant, string> = {
  error: "athletes.statusError",
  "no-athletes": "athletes.statusNoAthletes",
  "no-matches": "athletes.statusNoMatches",
  "out-of-range": "athletes.statusOutOfRange",
};

const LINK_LABEL_KEY: Partial<Record<DiscoveryStatusVariant, string>> = {
  error: "athletes.tryAgain",
  "no-matches": "athletes.clearFilters",
  "out-of-range": "athletes.backToFirstPage",
};

export function DiscoveryStatus({ variant, locale }: DiscoveryStatusProps) {
  const t = (key: string) => translate(locale, key);
  const linkLabelKey = LINK_LABEL_KEY[variant];

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <p className="text-sm text-ink-500">{t(COPY_KEY[variant])}</p>
      {linkLabelKey && (
        <Link
          href="/athletes"
          className="text-sm font-medium text-brand-700 underline hover:text-brand-800"
        >
          {t(linkLabelKey)}
        </Link>
      )}
    </div>
  );
}
