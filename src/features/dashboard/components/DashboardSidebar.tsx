import Link from "next/link";
import { DASHBOARD_NAV_ITEMS } from "../nav-items";
import { DashboardProfileStrengthCard } from "./DashboardProfileStrengthCard";
import type { ProfileStrength } from "@/lib/athlete/profile-strength";

interface DashboardSidebarProps {
  profileStrength: ProfileStrength;
  t: (key: string) => string;
}

// Desktop-only vertical nav (hidden below lg; DashboardMobileNav is the
// mobile/tablet equivalent, sharing the same DASHBOARD_NAV_ITEMS list).
// "Dashboard" is always the active item -- /dashboard is the only real
// destination among these 8 today, so there's nothing else to compute an
// active state against.
export function DashboardSidebar({ profileStrength, t }: DashboardSidebarProps) {
  return (
    <nav
      aria-label={t("dashboard.nav.ariaLabel")}
      className="hidden lg:sticky lg:top-24 lg:flex lg:w-full lg:flex-col lg:gap-1"
    >
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === "dashboard";

        if (!item.href) {
          return (
            <span
              key={item.key}
              aria-disabled="true"
              className="flex h-[46px] cursor-not-allowed items-center gap-3 rounded-[11px] px-3.5 text-[15px] font-medium text-[#5c6a99]/70"
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
            className={
              isActive
                ? "flex h-[46px] items-center gap-3 rounded-[11px] border border-[#7a9dff]/40 bg-gradient-to-r from-[#4d7cff]/28 to-[#4d7cff]/8 px-3.5 text-[15px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
                : "flex h-[46px] items-center gap-3 rounded-[11px] border border-transparent px-3.5 text-[15px] font-medium text-[#a5b0d0] transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7cff]"
            }
          >
            <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">{t(`dashboard.nav.${item.key}`)}</span>
          </Link>
        );
      })}

      <div className="mt-4">
        <DashboardProfileStrengthCard strength={profileStrength} t={t} />
      </div>
    </nav>
  );
}
