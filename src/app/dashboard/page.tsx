import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { getAthleteDashboardData } from "@/features/dashboard/data/get-athlete-dashboard";
import { AthleteDashboard } from "@/features/dashboard/components/AthleteDashboard";
import { getPostLoginDestination } from "@/lib/auth/post-login-destination";
import { getServerTranslations } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Dashboard | SportFo",
  description: "Your SportFo athlete dashboard.",
};

// Authenticated-only (see PROTECTED_ROUTES in src/proxy.ts for the
// optimistic gate; this re-verifies server-side, same pattern as every
// other protected page in the app). Only a registered Athlete (a
// *submitted* athlete_profiles row) ever sees the dashboard itself --
// everyone else (no registration at all, an unfinished draft, or a
// submitted non-Athlete category) is routed to the exact same destination
// getPostLoginDestination would already send them to, so a bookmarked or
// directly-typed /dashboard URL can never show a broken/empty dashboard
// to the wrong account. This is intentionally the ONE dashboard this
// route serves today -- see the task report for how future per-role
// dashboards would extend this.
export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth?next=%2Fdashboard");
  }

  const supabase = await createClient();
  const data = await getAthleteDashboardData(supabase, user.id);

  if (!data) {
    const { destination } = await getPostLoginDestination(supabase, user.id, null);
    // Defensive only -- getPostLoginDestination can never itself return
    // "/dashboard" for an account getAthleteDashboardData just returned
    // null for, since both ultimately key off the same "submitted Athlete
    // registration" condition. Guards against a future edit to either
    // function accidentally introducing a redirect loop.
    redirect(destination === "/dashboard" ? "/#community" : destination);
  }

  const { t, locale } = await getServerTranslations();

  return <AthleteDashboard data={data} t={t} locale={locale} />;
}
