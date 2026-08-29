"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface SiteChromeProps {
  // Pre-rendered by the (Server Component) root layout and passed through
  // as plain nodes -- Header/Footer/WelcomeToast do their own
  // server-side data fetching (AuthNav's identity lookup, locale, etc.)
  // and can't be imported/rendered directly inside a "use client" file.
  // This component only ever decides WHETHER to include them, never HOW
  // they're rendered.
  header: ReactNode;
  footer: ReactNode;
  welcomeToast: ReactNode;
  children: ReactNode;
}

// The Athlete Dashboard (/dashboard) is a fully self-contained dark-themed
// authenticated surface with its own header, nav, and footer (see
// DashboardHeader/AthleteDashboard) -- it must never be double-wrapped by
// the public site's light Header/Footer. Every other route keeps exactly
// the same chrome it always had. This is the one place that decides
// "does this route get the public site chrome", so it can never drift
// out of sync between the two dashboards' actual layouts.
export function SiteChrome({ header, footer, welcomeToast, children }: SiteChromeProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname?.startsWith("/dashboard/");

  if (isDashboard) {
    return <main className="flex flex-1 flex-col">{children}</main>;
  }

  return (
    <>
      {welcomeToast}
      {header}
      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
    </>
  );
}
