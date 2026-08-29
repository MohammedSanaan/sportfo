"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AthleteAvatar } from "@/components/ui/AthleteAvatar";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import type { Locale } from "@/i18n/config";

interface DashboardAccountMenuProps {
  fullName: string | null;
  photoUrl: string | null;
  roleLine: string;
  isAdmin: boolean;
  sportfoUserLabel: string;
  viewProfileLabel: string;
  viewAdminDashboardLabel: string;
  signOutLabel: string;
  loggingOutLabel: string;
  locale: Locale;
}

// The dashboard's own dark-themed account chip -- reuses the same
// identity DATA (fullName/photoUrl/isAdmin, resolved once in
// get-athlete-dashboard.ts via the shared getOwnAccountIdentity helper,
// never re-resolved here) and the same LogoutButton/AthleteAvatar
// components as the public site's AccountMenu, but with its own
// presentation: AccountMenu.tsx is styled for the light public header and
// would look visually broken floating on the dashboard's dark background.
export function DashboardAccountMenu({
  fullName,
  photoUrl,
  roleLine,
  isAdmin,
  sportfoUserLabel,
  viewProfileLabel,
  viewAdminDashboardLabel,
  signOutLabel,
  loggingOutLabel,
  locale,
}: DashboardAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1 pr-3.5 pl-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
      >
        <AthleteAvatar fullName={fullName} photoUrl={photoUrl} size="sm" />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-[#e8ecf8]">
            {fullName || sportfoUserLabel}
          </span>
          <span className="block text-[11px] tracking-[0.04em] text-[#8b96b8]">{roleLine}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0d1430] py-1.5 shadow-xl"
        >
          <Link
            href="/athlete/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-medium text-[#cddaff] transition-colors hover:bg-white/5"
          >
            {viewProfileLabel}
          </Link>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-[#cddaff] transition-colors hover:bg-white/5"
            >
              {viewAdminDashboardLabel}
            </Link>
          )}
          <div className="my-1 h-px bg-white/10" />
          <LogoutButton
            locale={locale}
            label={signOutLabel}
            busyLabel={loggingOutLabel}
            className="w-full rounded-none px-4 py-2.5 text-left text-sm font-medium text-[#ff7fa4] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
}
