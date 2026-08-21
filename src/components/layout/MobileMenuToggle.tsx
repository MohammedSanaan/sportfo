"use client";

import { useState, type ReactNode } from "react";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 5.5h14M3 10h14M3 14.5h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 4.5l11 11M15.5 4.5l-11 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Owns only open/closed state and the trigger button; the panel's content
// (Discover Athletes, AuthNav) is passed in as children so it can stay a
// real async Server Component -- this toggle never needs to know what's
// inside it.
export function MobileMenuToggle({
  children,
  triggerClassName,
}: {
  children: ReactNode;
  // Lets a caller override the trigger's colours for a context this
  // component doesn't know about on its own -- e.g. the homepage header
  // sitting transparent over a dark hero image, where the default
  // text-ink-700 would be unreadable. Falls back to the original styling.
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className={
          triggerClassName ??
          "flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        }
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-16 z-30 flex flex-col gap-1 border-b border-border-default bg-surface px-4 pb-6 pt-3 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}
