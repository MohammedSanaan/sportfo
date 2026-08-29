"use client";

import { useEffect, useState } from "react";
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
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#e8ecf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff] lg:hidden"
      >
        <Menu aria-hidden className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={t("dashboard.nav.closeMenu")}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <nav
            aria-label={t("dashboard.nav.ariaLabel")}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto border-r border-white/10 bg-[#0a0f22] p-4 pt-6"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-lg font-extrabold text-[#e8ecf8]">
                Sport<span className="text-[#4d7cff]">Fo</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("dashboard.nav.closeMenu")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8b96b8] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
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
                    className="flex h-12 cursor-not-allowed items-center gap-3 rounded-[11px] px-3.5 text-[15px] font-medium text-[#5c6a99]/70"
                  >
                    <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{t(`dashboard.nav.${item.key}`)}</span>
                    <span className="text-[10px] font-semibold tracking-wide text-[#5c6a99]/60 uppercase">
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
                      ? "flex h-12 items-center gap-3 rounded-[11px] border border-[#7a9dff]/40 bg-gradient-to-r from-[#4d7cff]/28 to-[#4d7cff]/8 px-3.5 text-[15px] font-bold text-white"
                      : "flex h-12 items-center gap-3 rounded-[11px] px-3.5 text-[15px] font-medium text-[#a5b0d0] hover:bg-white/[0.06]"
                  }
                >
                  <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 text-left">{t(`dashboard.nav.${item.key}`)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
