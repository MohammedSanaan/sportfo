"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { SPORTS_GROUPED_FOR_BROWSING, type SportCatalogEntry } from "@/lib/sports/catalog";
import { FieldShell } from "@/components/ui/FieldShell";
import { rankedSearch } from "./SportCombobox";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <circle cx="9" cy="9" r="6.25" />
      <path d="M17 17l-4-4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}

type Row = { kind: "header"; label: string } | { kind: "option"; entry: SportCatalogEntry };

interface SecondarySportsFieldProps {
  id: string;
  label: string;
  value: string[];
  onChange: (sports: string[]) => void;
  // Excluded from both the browse list and search results, and from the
  // selected chips -- see task spec: "Primary Sport cannot duplicate in
  // Secondary Sports."
  primarySport: string;
  placeholder: string;
  noResultsLabel: string;
  removeLabel: string;
  helperText?: string;
  error?: string;
}

// A searchable multi-select over the exact same SPORTS_CATALOG/
// SPORTS_GROUPED_FOR_BROWSING data SportCombobox (Primary Sport) already
// uses -- never a second, separately-maintained sports list. Selecting an
// option adds it to `value` and keeps the menu open (unlike the
// single-select combobox, which closes on pick); each selection also
// renders as a removable chip below, matching the visual language of the
// Support Needed pill picker.
export function SecondarySportsField({
  id,
  label,
  value,
  onChange,
  primarySport,
  placeholder,
  noResultsLabel,
  removeLabel,
  helperText,
  error,
}: SecondarySportsFieldProps) {
  const listboxId = `${id}-listbox`;
  const reactId = useId();
  const optionIdFor = (sport: string) => `${id}-option-${reactId}-${sport}`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Never offers the current primary sport or an already-selected
  // secondary sport as a pickable option -- this is the actual duplicate
  // -prevention mechanism (not just a display nicety).
  const isSelectable = (sport: string) => sport !== primarySport && !value.includes(sport);

  const rows: Row[] = useMemo(() => {
    const source =
      query.trim().length > 0
        ? rankedSearch(query).map((entry) => ({ kind: "option", entry }) as const)
        : SPORTS_GROUPED_FOR_BROWSING.flatMap((group) => [
            { kind: "header", label: group.group } as const,
            ...group.sports.map((entry) => ({ kind: "option", entry }) as const),
          ]);

    // Drop now-unselectable options, then drop any header left with no
    // options under it (a browse-mode group that became empty).
    const filtered = source.filter((row) => row.kind === "header" || isSelectable(row.entry.sport));
    return filtered.filter((row, index) => {
      if (row.kind !== "header") return true;
      const next = filtered[index + 1];
      return next?.kind === "option";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, primarySport, value]);

  const options = useMemo(
    () => rows.filter((row): row is { kind: "option"; entry: SportCatalogEntry } => row.kind === "option"),
    [rows],
  );

  function openMenu() {
    setIsOpen(true);
    setActiveIndex(0);
  }

  function closeMenu() {
    setIsOpen(false);
    setQuery("");
  }

  function selectOption(entry: SportCatalogEntry) {
    onChange([...value, entry.sport]);
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus();
  }

  function removeSport(sport: string) {
    onChange(value.filter((s) => s !== sport));
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
    } else if (event.key === "Backspace" && query === "" && value.length > 0) {
      // Backspacing on an empty query removes the most recently added chip
      // -- the same "backspace pops the last tag" convention as most tag
      // pickers, never a surprise bulk-clear.
      removeSport(value[value.length - 1]);
    }
  }

  const activeOption = options[activeIndex];

  return (
    <FieldShell label={label} htmlFor={id} optional helperText={helperText} error={error}>
      <div className="relative">
        <div
          className={cn(
            "flex h-12 items-center gap-2 rounded-xl border bg-surface px-3.5 transition-colors",
            error ? "border-red-400" : "border-border-default",
            isOpen && "border-brand-500 ring-2 ring-brand-100",
          )}
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOption ? optionIdFor(activeOption.entry.sport) : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onFocus={openMenu}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={closeMenu}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </div>

        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
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
                  aria-selected={false}
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
                    <span className="truncate text-ink-900">{row.entry.sport}</span>
                    {row.entry.categories.length > 0 && (
                      <span className="truncate text-xs text-ink-400">{row.entry.categories.join(" • ")}</span>
                    )}
                  </span>
                </li>
              ),
            )
          )}
        </ul>
      </div>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((sport) => (
            <span
              key={sport}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pr-1.5 pl-3 text-sm font-medium text-brand-700"
            >
              {sport}
              <button
                type="button"
                onClick={() => removeSport(sport)}
                aria-label={`${removeLabel} ${sport}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-100 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </FieldShell>
  );
}
