import Link from "next/link";
import { DashboardAccountMenu } from "./DashboardAccountMenu";
import { DashboardMobileNav } from "./DashboardMobileNav";
import type { DashboardIdentity } from "../types";
import type { Locale } from "@/i18n/config";

interface DashboardHeaderProps {
  identity: DashboardIdentity;
  roleLine: string;
  t: (key: string) => string;
  locale: Locale;
}

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[#8b96b8]">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[#b9c3e0]">
      <path
        d="M6 8a4 4 0 0 1 8 0c0 3.2 1 4.5 1.5 5H4.5C5 12.5 6 11.2 6 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.2 15.5a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// The dashboard's own sticky top bar -- logo, a real search (a plain GET
// form to /athletes, so it needs no client JS and never fakes results
// from a multi-entity search backend that doesn't exist), a decorative
// notifications bell (no notifications backend exists yet, so no badge
// count -- see AthleteDashboardData.notifications), and the account
// menu. Server-rendered except for the two small islands that genuinely
// need interactivity (account dropdown, mobile nav drawer).
export function DashboardHeader({ identity, roleLine, t, locale }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/[0.07] bg-[#090e22]/80 px-4 py-3 backdrop-blur-lg sm:gap-7 sm:px-8">
      <DashboardMobileNav t={t} />

      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#4d7cff] bg-gradient-to-br from-[#16255e] to-[#0b1130]">
          <span className="h-3.5 w-3.5 rotate-45 rounded-[3px] bg-[#4d7cff]" />
        </span>
        <span className="hidden text-xl font-extrabold tracking-tight text-[#e8ecf8] sm:inline">
          Sport<span className="text-[#4d7cff]">Fo</span>
        </span>
      </Link>

      <form
        action="/athletes"
        method="get"
        role="search"
        className="hidden max-w-xl flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 md:flex"
      >
        <SearchIcon />
        <input
          type="search"
          name="q"
          placeholder={t("dashboard.header.searchPlaceholder")}
          aria-label={t("dashboard.header.searchPlaceholder")}
          className="w-full bg-transparent text-sm text-[#e8ecf8] placeholder:text-[#6c789c] focus:outline-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.09] bg-white/5"
          aria-hidden
          title={t("dashboard.header.notificationsComingSoon")}
        >
          <BellIcon />
        </span>
        <DashboardAccountMenu
          fullName={identity.fullName}
          photoUrl={identity.photoUrl}
          roleLine={roleLine}
          isAdmin={identity.isAdmin}
          sportfoUserLabel={t("account.sportfoUser")}
          viewProfileLabel={t("account.viewProfile")}
          viewAdminDashboardLabel={t("account.viewDashboard")}
          signOutLabel={t("account.signOut")}
          loggingOutLabel={t("nav.loggingOut")}
          locale={locale}
        />
      </div>
    </header>
  );
}
