"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The homepage's one detail surface.
 *
 * Discovery, Opportunities and Events all need the same thing: a click that
 * goes somewhere. Rather than three bespoke modals, every "view details"
 * interaction on the page opens this -- a right-side panel on wide screens,
 * a bottom sheet on narrow ones, closed by Escape, backdrop click, or the
 * close button. Scroll is locked on the body while it's open so the page
 * behind it can't drift.
 */
export function Overlay({
  open,
  onClose,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-navy-975/60 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface shadow-[-24px_0_60px_-24px_rgba(10,22,40,0.35)]",
          "animate-[sf-overlay-in_0.35s_cubic-bezier(0.16,1,0.3,1)_both]",
        )}
      >
        {children}
        {/* Rendered after `children` rather than before: both this button and
            the drawer photo are positioned elements with no z-index, so paint
            order follows DOM order — this button must come last to stay on
            top of a full-bleed image at the top of the panel. */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-border-default bg-surface text-ink-500 shadow-sm transition-colors hover:border-border-strong hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="h-4 w-4">
      <path
        d="M3 3l10 10M13 3 3 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
