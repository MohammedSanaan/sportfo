import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  HandCoins,
  CalendarDays,
  Mail,
  Settings,
} from "lucide-react";

export interface DashboardNavItem {
  /** i18n key segment under dashboard.nav.{key}. */
  key: string;
  /** Real route, or null for a not-yet-available feature (rendered
   * disabled -- see DashboardSidebar/DashboardMobileNav -- never a
   * misleading link to a page that doesn't exist). */
  href: string | null;
  icon: LucideIcon;
}

// Single source of truth for both the desktop sidebar and the mobile
// drawer, so the two can never drift out of sync. Only "Dashboard" and
// "My Profile" point at real routes today -- the rest render as disabled/
// "Coming soon" items rather than dead links (see task spec: Opportunities,
// Coaches & Academies, Sponsorship Tracker, Events & Trials, Messages, and
// Settings have no dedicated page yet).
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "myProfile", href: "/athlete/profile", icon: User },
  { key: "opportunities", href: null, icon: Briefcase },
  { key: "coachesAcademies", href: null, icon: GraduationCap },
  { key: "sponsorshipTracker", href: null, icon: HandCoins },
  { key: "eventsTrials", href: null, icon: CalendarDays },
  { key: "messages", href: null, icon: Mail },
  { key: "settings", href: null, icon: Settings },
];
