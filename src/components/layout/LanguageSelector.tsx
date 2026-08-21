"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { LOCALES, LOCALE_LABELS, LOCALE_TRIGGER_LABELS } from "@/i18n/config";
import { useTranslation } from "@/i18n/LocaleProvider";

function GlobeIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9z" strokeWidth="1.6" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Same trigger/menu used in both the desktop header and the mobile
// hamburger panel -- one implementation, styled with the site's existing
// tokens (border-default, ink/brand text, rounded-lg/xl) rather than a
// visually unrelated control.
export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.selectorLabel")}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border-default bg-surface px-3 text-sm font-medium text-ink-700 transition-colors hover:border-brand-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      >
        <GlobeIcon />
        {LOCALE_TRIGGER_LABELS[locale]}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language.selectorLabel")}
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border-default bg-surface py-1 shadow-lg"
        >
          {LOCALES.map((code) => {
            const selected = locale === code;
            return (
              <li key={code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2 text-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:bg-surface-muted",
                    selected ? "font-semibold text-brand-700" : "text-ink-700",
                  )}
                >
                  {LOCALE_LABELS[code]}
                  {selected && <CheckIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
