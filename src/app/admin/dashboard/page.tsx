import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getAuthUser } from "@/lib/supabase/auth-user";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/i18n/server";
import {
  resolveDashboardRange,
  DASHBOARD_RANGE_KEYS,
  type DashboardRangeKey,
} from "@/lib/admin/dashboard-range";
import { REGISTRATION_CATEGORIES, getRegistrationCategoryByType } from "@/lib/registration/categories";
import { AccessDenied } from "@/features/admin-dashboard/components/AccessDenied";
import { KpiCards } from "@/features/admin-dashboard/components/KpiCards";
import { DashboardFilters } from "@/features/admin-dashboard/components/DashboardFilters";
import { RegistrationTrendChart } from "@/features/admin-dashboard/components/RegistrationTrendChart";
import { CategoryBreakdown } from "@/features/admin-dashboard/components/CategoryBreakdown";
import { RegistrationsTable } from "@/features/admin-dashboard/components/RegistrationsTable";

export const metadata: Metadata = { title: "Admin Dashboard | SportFo" };

const STATUS_VALUES = ["draft", "submitted", "verified", "rejected"] as const;
const PAGE_SIZE = 20;

interface AdminDashboardPageProps {
  searchParams: Promise<{
    range?: string;
    category?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

// Authorization is enforced entirely server-side, twice over: Proxy
// (src/proxy.ts) optimistically redirects a signed-out visitor before this
// component ever runs, and -- the real check -- is_current_user_admin()
// re-verifies against the database for every single request, regardless
// of how the visitor got here. A normal authenticated (non-admin) user
// reaches the `if (!isAdmin)` branch below and sees AccessDenied, never
// any dashboard data; nothing here depends on hiding a nav link.
export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/auth?next=%2Fadmin%2Fdashboard");
  }

  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_current_user_admin");
  const { t, locale } = await getServerTranslations();

  if (!isAdmin) {
    return (
      <Container className="flex min-h-[50vh] flex-col items-center justify-center py-16">
        <AccessDenied locale={locale} />
      </Container>
    );
  }

  const params = await searchParams;
  const rangeKey: DashboardRangeKey = (
    DASHBOARD_RANGE_KEYS as readonly string[]
  ).includes(params.range ?? "")
    ? (params.range as DashboardRangeKey)
    : "thisMonth";
  const categoryFilter = REGISTRATION_CATEGORIES.some((c) => c.registrationType === params.category)
    ? (params.category as string)
    : null;
  const statusFilter = (STATUS_VALUES as readonly string[]).includes(params.status ?? "")
    ? (params.status as string)
    : null;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const range = resolveDashboardRange(rangeKey, params.from, params.to);

  // Every count/grouping below happens in Postgres (admin_* RPCs) -- never
  // "fetch everything and count in JS."
  const [kpisResult, trendResult, breakdownResult, listResult] = await Promise.all([
    supabase.rpc("admin_registration_kpis"),
    supabase.rpc("admin_registration_trend", { p_from: range.dateFrom, p_to: range.dateTo }),
    supabase.rpc("admin_category_breakdown", {
      p_from: range.timestampFrom,
      p_to: range.timestampTo,
    }),
    supabase.rpc("admin_list_registrations", {
      p_category: categoryFilter ?? undefined,
      p_status: statusFilter ?? undefined,
      p_from: range.timestampFrom,
      p_to: range.timestampTo,
      p_page: page,
      p_page_size: PAGE_SIZE,
    }),
  ]);

  const kpis = (kpisResult.data ?? {}) as { today?: number; week?: number; month?: number; year?: number };
  const trend = (trendResult.data ?? []) as { day: string; registrations: number }[];
  const breakdown = (breakdownResult.data ?? []) as { registration_type: string; registrations: number }[];
  const listData = (listResult.data ?? { total: 0, rows: [] }) as {
    total: number;
    rows: {
      id: string;
      sportfo_id: string | null;
      display_name: string | null;
      registration_type: string;
      status: string;
      registered_at: string | null;
    }[];
  };

  function buildPageHref(targetPage: number): string {
    const query = new URLSearchParams();
    query.set("range", rangeKey);
    if (rangeKey === "custom") {
      if (params.from) query.set("from", params.from);
      if (params.to) query.set("to", params.to);
    }
    if (categoryFilter) query.set("category", categoryFilter);
    if (statusFilter) query.set("status", statusFilter);
    query.set("page", String(targetPage));
    return `/admin/dashboard?${query.toString()}`;
  }

  const breakdownItems = breakdown.map((item) => {
    const config = getRegistrationCategoryByType(item.registration_type);
    return {
      registrationType: item.registration_type,
      label: config ? t(`home.community.roles.${config.roleKey}.title`) : item.registration_type,
      count: item.registrations,
    };
  });

  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-2 sm:mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          {t("adminDashboard.pageTitle")}
        </h1>
        <p className="text-base text-ink-500">{t("adminDashboard.pageSubtitle")}</p>
      </div>

      <div className="flex flex-col gap-6">
        <KpiCards
          today={kpis.today ?? 0}
          week={kpis.week ?? 0}
          month={kpis.month ?? 0}
          year={kpis.year ?? 0}
          labels={{
            today: t("adminDashboard.kpi.today"),
            week: t("adminDashboard.kpi.week"),
            month: t("adminDashboard.kpi.month"),
            year: t("adminDashboard.kpi.year"),
          }}
        />

        <DashboardFilters
          locale={locale}
          range={rangeKey}
          category={categoryFilter ?? ""}
          status={statusFilter ?? ""}
          from={params.from}
          to={params.to}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RegistrationTrendChart
            data={trend}
            title={t("adminDashboard.trend.title")}
            emptyLabel={t("adminDashboard.trend.empty")}
          />
          <CategoryBreakdown
            items={breakdownItems}
            title={t("adminDashboard.breakdown.title")}
            emptyLabel={t("adminDashboard.breakdown.empty")}
          />
        </div>

        <RegistrationsTable
          rows={listData.rows}
          total={listData.total}
          page={page}
          pageSize={PAGE_SIZE}
          locale={locale}
          buildPageHref={buildPageHref}
        />
      </div>
    </Container>
  );
}
