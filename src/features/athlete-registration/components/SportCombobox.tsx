"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { cn } from "@/lib/cn";
import {
  SPORTS_CATALOG,
  SPORTS_GROUPED_FOR_BROWSING,
  type SportCatalogEntry,
} from "@/lib/sports/catalog";
import { FieldShell } from "@/components/ui/FieldShell";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <circle cx="9" cy="9" r="6.25" />
      <path d="M17 17l-4-4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M5.5 7.5 10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Matches every word in the query as a substring of the sport's label, in
// any order -- "athletics javelin" finds "Athletics – Javelin Throw",
// "cric" finds every *Cricket entry, "mma" finds "Mixed Martial Arts (MMA)".
// Never searches the internal alias/mapping labels, only the visible name.
// Exported for SecondarySportsField, which needs the exact same ranked
// search behaviour over the exact same catalog -- never a second sports
// list (see task spec).
export function matchesQuery(label: string, query: string): boolean {
  const haystack = label.toLowerCase();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return words.every((word) => haystack.includes(word));
}

export function rankedSearch(query: string): SportCatalogEntry[] {
  const q = query.toLowerCase().trim();
  return SPORTS_CATALOG.filter((entry) => matchesQuery(entry.sport, query)).sort((a, b) => {
    const aStarts = a.sport.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.sport.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });
}

type Row = { kind: "header"; label: string } | { kind: "option"; entry: SportCatalogEntry };

interface SportComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (sport: string) => void;
  onBlur?: () => void;
  categoryLabel?: string;
  placeholder: string;
  noResultsLabel: string;
  error?: string;
  helperText?: string;
  name?: string;
  ref?: Ref<HTMLInputElement>;
}

export function SportCombobox({
  id,
  label,
  value,
  onChange,
  onBlur,
  categoryLabel,
  placeholder,
  noResultsLabel,
  error,
  helperText,
  name,
  ref,
}: SportComboboxProps) {
  const listboxId = `${id}-listbox`;
  const reactId = useId();
  const optionIdFor = (sport: string) => `${id}-option-${reactId}-${sport}`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const rows: Row[] = useMemo(() => {
    if (query.trim().length > 0) {
      return rankedSearch(query).map((entry) => ({ kind: "option", entry }) as const);
    }
    return SPORTS_GROUPED_FOR_BROWSING.flatMap((group) => [
      { kind: "header", label: group.group } as const,
      ...group.sports.map((entry) => ({ kind: "option", entry }) as const),
    ]);
  }, [query]);

  const options = useMemo(
    () => rows.filter((row): row is { kind: "option"; entry: SportCatalogEntry } => row.kind === "option"),
    [rows],
  );

  function openMenu() {
    setIsOpen(true);
    setQuery("");
    const selectedIndex = options.findIndex((o) => o.entry.sport === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function closeMenu() {
    setIsOpen(false);
    setQuery("");
  }

  function selectOption(entry: SportCatalogEntry) {
    onChange(entry.sport);
    closeMenu();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(options.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const active = options[activeIndex];
      if (active) {
        event.preventDefault();
        selectOption(active.entry);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  }

  const activeOption = options[activeIndex];

  return (
    <FieldShell label={label} htmlFor={id} helperText={helperText} error={error}>
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "flex h-12 items-center gap-2 rounded-xl border bg-surface px-3.5 transition-colors",
            error ? "border-red-400" : "border-border-default",
            isOpen && "border-brand-500 ring-2 ring-brand-100",
          )}
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            ref={ref}
            id={id}
            name={name}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOption ? optionIdFor(activeOption.entry.sport) : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            placeholder={placeholder}
            value={isOpen ? query : value}
            onFocus={openMenu}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              closeMenu();
              onBlur?.();
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          {!isOpen && value && (
            <>
              {categoryLabel && (
                <span className="hidden shrink-0 items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 sm:inline-flex">
                  {categoryLabel}
                </span>
              )}
              <CheckIcon className="h-4 w-4 shrink-0 text-success-500" />
            </>
          )}
          <ChevronIcon
            className={cn(
              "h-4 w-4 shrink-0 text-ink-400 transition-transform duration-150",
              isOpen && "rotate-180",
            )}
          />
        </div>

        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-hidden={!isOpen}
          className={cn(
            "absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border-default bg-surface p-1.5 shadow-lg",
            "origin-top transition-all duration-150 ease-out motion-reduce:transition-none",
            isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0",
          )}
        >
          {rows.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-ink-400">{noResultsLabel}</li>
          ) : (
            rows.map((row) =>
              row.kind === "header" ? (
                  <li
                    key={`header-${row.label}`}
                    role="presentation"
                    className="px-2.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400 first:pt-1.5"
                  >
                    {row.label}
                  </li>
                ) : (
                  <li
                    key={row.entry.sport}
                    id={optionIdFor(row.entry.sport)}
                    role="option"
                    aria-selected={row.entry.sport === value}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectOption(row.entry);
                    }}
                    onMouseEnter={() => setActiveIndex(options.findIndex((o) => o.entry.sport === row.entry.sport))}
                    className={cn(
                      "flex cursor-pointer items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      row.entry.sport === activeOption?.entry.sport ? "bg-brand-50" : "hover:bg-surface-muted",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={cn(
                          "truncate text-ink-900",
                          row.entry.sport === value && "font-medium",
                        )}
                      >
                        {row.entry.sport}
                      </span>
                      {row.entry.categories.length > 0 && (
                        <span className="truncate text-xs text-ink-400">
                          {row.entry.categories.join(" • ")}
                        </span>
                      )}
                    </span>
                    {row.entry.sport === value && (
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                    )}
                  </li>
                ),
            )
          )}
        </ul>
      </div>
    </FieldShell>
  );
}
