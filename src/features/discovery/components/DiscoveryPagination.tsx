import Link from "next/link";
import type { RawDiscoverySearchParams } from "@/lib/athlete/discovery";

interface DiscoveryPaginationProps {
  page: number;
  totalPages: number;
  searchParams: RawDiscoverySearchParams;
}

function buildHref(searchParams: RawDiscoverySearchParams, page: number): string {
  const params = new URLSearchParams();
  const entries: [string, string | string[] | undefined][] = [
    ["q", searchParams.q],
    ["sport", searchParams.sport],
    ["country", searchParams.country],
    ["city", searchParams.city],
    ["skill", searchParams.skill],
  ];

  for (const [key, value] of entries) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();
  return qs ? `/athletes?${qs}` : "/athletes";
}

const pageLinkClassName =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors";

export function DiscoveryPagination({ page, totalPages, searchParams }: DiscoveryPaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-2">
      {hasPrev ? (
        <Link
          href={buildHref(searchParams, page - 1)}
          className={`${pageLinkClassName} border-border-strong text-ink-700 hover:bg-surface-muted`}
        >
          Previous
        </Link>
      ) : (
        <span
          aria-hidden
          className={`${pageLinkClassName} border-border-default text-ink-300`}
        >
          Previous
        </span>
      )}

      <span className="text-sm text-ink-500">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(searchParams, page + 1)}
          className={`${pageLinkClassName} border-border-strong text-ink-700 hover:bg-surface-muted`}
        >
          Next
        </Link>
      ) : (
        <span
          aria-hidden
          className={`${pageLinkClassName} border-border-default text-ink-300`}
        >
          Next
        </span>
      )}
    </nav>
  );
}
