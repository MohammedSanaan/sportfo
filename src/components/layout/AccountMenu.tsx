"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { Locale } from "@/i18n/config";

interface AccountMenuProps {
  sportfoId: string;
  // null when this account has no submitted role yet (e.g. mid-
  // registration) -- never a fabricated role. Athlete is the only real
  // role today; the trigger/menu structure is otherwise already
  // role-agnostic so Coach/Creator can be added later as more entries in
  // this same list, not a rebuild.
  roleLabel: string | null;
  myProfileHref: string;
  myProfileLabel: string;
  discoverAthletesHref: string;
  discoverAthletesLabel: string;
  activeAsLabel: string;
  sportfoIdLabel: string;
  activeAccountLabel: string;
  locale: Locale;
  className?: string;
  // "desktop": compact dropdown trigger in the header bar. "mobile": the
  // hamburger panel is already the "opened" state, so this renders as a
  // flat, always-expanded block instead of a second nested dropdown that
  // would need its own extra tap.
  variant?: "desktop" | "mobile";
}

function StatusDot() {
  return (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full bg-success-500"
      title="Active session"
    />
  );
}

export function AccountMenu({
  sportfoId,
  roleLabel,
  myProfileHref,
  myProfileLabel,
  discoverAthletesHref,
  discoverAthletesLabel,
  activeAsLabel,
  sportfoIdLabel,
  activeAccountLabel,
  locale,
  className,
  variant = "desktop",
}: AccountMenuProps) {
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

  if (variant === "mobile") {
    return (
      <div className={cn("flex flex-col gap-3 rounded-lg border border-border-default p-3", className)}>
        <div className="flex items-center gap-2">
          <StatusDot />
          <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">
            {activeAccountLabel}
          </span>
        </div>
        <div>
          <p className="text-base font-semibold text-ink-900">{sportfoId}</p>
          {roleLabel && (
            <p className="text-sm text-ink-500">
              {activeAsLabel} {roleLabel}
            </p>
          )}
        </div>
        <Link
          href={discoverAthletesHref}
          className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-ink-700 hover:bg-surface-muted"
        >
          {discoverAthletesLabel}
        </Link>
        <Link
          href={myProfileHref}
          className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-ink-700 hover:bg-surface-muted"
        >
          {myProfileLabel}
        </Link>
        <LogoutButton locale={locale} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={sportfoIdLabel}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border-default bg-surface px-3 text-sm transition-colors hover:border-brand-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      >
        <StatusDot />
        <span className="flex flex-col items-start leading-tight">
          <span className="font-semibold text-ink-900">{sportfoId}</span>
          {roleLabel && (
            <span className="text-[11px] text-ink-500">
              {activeAsLabel} {roleLabel} ▾
            </span>
          )}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border-default bg-surface py-1 shadow-lg"
        >
          <Link
            href={discoverAthletesHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink-700 transition-colors hover:bg-surface-muted"
          >
            {discoverAthletesLabel}
          </Link>
          <Link
            href={myProfileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3.5 py-2 text-sm text-ink-700 transition-colors hover:bg-surface-muted"
          >
            {myProfileLabel}
          </Link>
          <div role="menuitem">
            <LogoutButton locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}
