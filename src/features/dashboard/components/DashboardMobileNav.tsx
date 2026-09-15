"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "../nav-items";
import { useTranslation } from "@/i18n/LocaleProvider";

// The mobile/tablet equivalent of DashboardSidebar -- a hamburger toggle
// (visible below lg) that opens a full-screen drawer over the same
// DASHBOARD_NAV_ITEMS list, never a squeezed-down copy of the desktop
// sidebar. Not sticky on mobile (the task spec is explicit about this) --
// it's a dismissible overlay, not a persistent rail.
//
// A Client Component, so it resolves its own strings via the client
// useTranslation() hook rather than receiving the server `t` function as
// a prop -- a function isn't a serializable value that can cross the
// Server/Client Component boundary (see DashboardHeader, which used to
// pass `t` in here and crashed with exactly that React error).
export function DashboardMobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("dashboard.nav.openMenu")}
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-surface-muted text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
      >
        <Menu aria-hidden className="h-5 w-5" />
      </button>

      {/* Portalled straight to <body>: DashboardHeader (this component's
          parent here) has backdrop-blur-lg for its own sticky glass
          effect, and a backdrop-filter ancestor becomes the containing
          block for any `position: fixed` descendant in Chrome -- without
          the portal, this drawer's "fixed inset-0" collapsed to the
          header's own short bounding box instead of covering the screen. */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label={t("dashboard.nav.closeMenu")}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink-900/50"
            />
            <nav
              aria-label={t("dashboard.nav.ariaLabel")}
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto border-r border-border-default bg-white p-4 pt-6 shadow-xl"
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-lg font-extrabold text-ink-900">
                  Sport<span className="text-brand-600">Fo</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t("dashboard.nav.closeMenu")}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <X aria-hidden className="h-5 w-5" />
                </button>
              </div>

              {DASHBOARD_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === "dashboard";

                if (!item.href) {
                  return (
                    <span
                      key={item.key}
                      aria-disabled="true"
                      className="flex min-h-12 py-2 cursor-not-allowed items-center gap-3 rounded-[11px] px-3.5 text-[15px] font-medium text-ink-400"
                    >
                      <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 text-left">{t(`dashboard.nav.${item.key}`)}</span>
                      <span className="text-[10px] font-semibold tracking-wide text-ink-400 uppercase">
                        {t("dashboard.nav.comingSoon")}
                      </span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={
                      isActive
                        ? "flex min-h-12 py-2 items-center gap-3 rounded-[11px] border border-brand-200 bg-brand-50 px-3.5 text-[15px] font-bold text-brand-700"
                        : "flex min-h-12 py-2 items-center gap-3 rounded-[11px] px-3.5 text-[15px] font-medium text-ink-600 hover:bg-surface-muted"
                    }
                  >
                    <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{t(`dashboard.nav.${item.key}`)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
