"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/account/initials";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { Locale } from "@/i18n/config";

interface AccountMenuProps {
  // Null until the account has a submitted registration in any category
  // -- never a fabricated name. sportfoUserLabel ("SportFo User") is shown
  // in its place when null.
  displayName: string | null;
  // Null until ensure_sportfo_id() has run for this session (rare). Never
  // the internal auth.users UUID -- see src/lib/account/identity.ts.
  sportfoId: string | null;
  // Translated label for the account's current registration category
  // (e.g. "Athlete", "Performance Expert") -- null when nothing's been
  // submitted yet. Resolved server-side from the most recently submitted
  // registration; there's no active-role system yet, so this is a
  // reasonable "current role" default, not a fabricated one.
  roleLabel: string | null;
  // Real route only -- Athlete's actual profile page, or the visitor's own
  // (pre-filled) registration form for the other 7 categories. Null hides
  // the "View Profile" item entirely rather than linking somewhere broken.
  profileHref: string | null;
  // Gated entirely by the server (sportfo_users.is_admin, re-checked again
  // by /admin/dashboard itself) -- this prop only controls whether the
  // *link* renders, never the actual authorization.
  isAdmin: boolean;
  dashboardHref: string;
  sportfoIdLabel: string;
  sportfoUserLabel: string;
  viewProfileLabel: string;
  viewDashboardLabel: string;
  signOutLabel: string;
  signingOutLabel: string;
  locale: Locale;
  className?: string;
  // "desktop": compact dropdown trigger in the header bar. "mobile": the
  // hamburger panel is already the "opened" state, so this renders as a
  // flat, always-expanded block instead of a second nested dropdown that
  // would need its own extra tap.
  variant?: "desktop" | "mobile";
}

function StatusDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("h-2.5 w-2.5 rounded-full border-2 border-surface bg-success-500", className)}
      title="Active session"
    />
  );
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-semibold text-white",
        size === "md" ? "h-9 w-9 text-sm" : "h-8 w-8 text-xs",
      )}
    >
      {initials || "SF"}
    </span>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M5.5 7.5 10 12l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <circle cx="10" cy="6.5" r="3.25" />
      <path d="M3.5 17c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <rect x="3" y="3" width="6" height="6" rx="1.2" />
      <rect x="11" y="3" width="6" height="4.5" rx="1.2" />
      <rect x="11" y="9.5" width="6" height="7.5" rx="1.2" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M8 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 13.5 17 10l-4-3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 10H8" strokeLinecap="round" />
    </svg>
  );
}

const menuItemClassName =
  "flex min-h-11 items-center gap-2.5 px-3.5 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-muted hover:text-ink-900";

export function AccountMenu({
  displayName,
  sportfoId,
  roleLabel,
  profileHref,
  isAdmin,
  dashboardHref,
  sportfoIdLabel,
  sportfoUserLabel,
  viewProfileLabel,
  viewDashboardLabel,
  signOutLabel,
  signingOutLabel,
  locale,
  className,
  variant = "desktop",
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameOrFallback = displayName || sportfoUserLabel;
  const initials = getInitials(displayName);

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
        <div className="flex items-center gap-3">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink-900">{nameOrFallback}</p>
            {roleLabel && <p className="truncate text-sm text-ink-500">{roleLabel}</p>}
          </div>
        </div>

        {sportfoId && (
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">{sportfoIdLabel}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">
              {sportfoId}
            </span>
          </div>
        )}

        <div className="flex flex-col border-t border-border-default pt-1">
          {profileHref && (
            <Link href={profileHref} className={cn(menuItemClassName, "rounded-lg text-base")}>
              <UserIcon className="h-4 w-4 shrink-0 text-ink-400" />
              {viewProfileLabel}
            </Link>
          )}
          {isAdmin && (
            <Link href={dashboardHref} className={cn(menuItemClassName, "rounded-lg text-base")}>
              <DashboardIcon className="h-4 w-4 shrink-0 text-ink-400" />
              {viewDashboardLabel}
            </Link>
          )}
          <LogoutButton
            locale={locale}
            label={signOutLabel}
            busyLabel={signingOutLabel}
            icon={<LogoutIcon className="h-4 w-4 shrink-0 text-ink-400" />}
            className={cn(
              menuItemClassName,
              "w-full rounded-lg justify-start text-base disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 items-center gap-2.5 rounded-xl border border-border-default bg-surface px-2.5 pr-3 transition-colors hover:border-brand-300 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
      >
        <span className="relative shrink-0">
          <Avatar initials={initials} />
          <StatusDot className="absolute -bottom-0.5 -right-0.5" />
        </span>
        <span className="flex max-w-[9.5rem] flex-col items-start leading-tight">
          <span className="w-full truncate text-sm font-semibold text-ink-900">{nameOrFallback}</span>
          {roleLabel && <span className="w-full truncate text-xs text-ink-500">{roleLabel}</span>}
        </span>
        <ChevronIcon
          className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={cn(
          "absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg",
          "transition-all duration-150 ease-out motion-reduce:transition-none",
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-border-default p-3.5">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{nameOrFallback}</p>
            {roleLabel && <p className="truncate text-xs text-ink-500">{roleLabel}</p>}
          </div>
        </div>

        {sportfoId && (
          <div className="border-b border-border-default px-3.5 py-3">
            <p className="text-[11px] font-medium tracking-wide text-ink-400 uppercase">{sportfoIdLabel}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700">
              {sportfoId}
            </span>
          </div>
        )}

        <div className="flex flex-col py-1">
          {profileHref && (
            <Link href={profileHref} role="menuitem" onClick={() => setOpen(false)} className={menuItemClassName}>
              <UserIcon className="h-4 w-4 shrink-0 text-ink-400" />
              {viewProfileLabel}
            </Link>
          )}
          {isAdmin && (
            <Link href={dashboardHref} role="menuitem" onClick={() => setOpen(false)} className={menuItemClassName}>
              <DashboardIcon className="h-4 w-4 shrink-0 text-ink-400" />
              {viewDashboardLabel}
            </Link>
          )}
        </div>

        <div role="menuitem" className="border-t border-border-default py-1">
          <LogoutButton
            locale={locale}
            label={signOutLabel}
            busyLabel={signingOutLabel}
            icon={<LogoutIcon className="h-4 w-4 shrink-0 text-ink-400" />}
            className={cn(
              menuItemClassName,
              "w-full justify-start disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>
      </div>
    </div>
  );
}
