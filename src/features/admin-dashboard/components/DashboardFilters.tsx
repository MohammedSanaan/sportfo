import { REGISTRATION_CATEGORIES } from "@/lib/registration/categories";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface DashboardFiltersProps {
  locale: Locale;
  range: string;
  category: string;
  status: string;
  from?: string;
  to?: string;
}

const controlClassName =
  "h-11 w-full rounded-xl border border-border-strong bg-surface px-3.5 text-sm text-ink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 sm:w-auto";

const STATUS_VALUES = ["draft", "submitted", "verified", "rejected"] as const;

// A plain GET <form> -- same pattern as DiscoveryFiltersForm: the browser
// puts every filter into the URL, so the result is shareable, bookmarkable,
// and refresh-safe with zero client-side state. The server page (page.tsx)
// is what actually resolves these into RPC calls.
export function DashboardFilters({ locale, range, category, status, from, to }: DashboardFiltersProps) {
  const t = (key: string) => translate(locale, key);

  return (
    <form
      method="GET"
      className="flex flex-col gap-3 rounded-2xl border border-border-default bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="range" className="text-xs font-semibold text-ink-500">
          {t("adminDashboard.filters.timeRange")}
        </label>
        <select id="range" name="range" defaultValue={range} className={controlClassName}>
          <option value="today">{t("adminDashboard.filters.today")}</option>
          <option value="last7days">{t("adminDashboard.filters.last7Days")}</option>
          <option value="thisMonth">{t("adminDashboard.filters.thisMonth")}</option>
          <option value="thisYear">{t("adminDashboard.filters.thisYear")}</option>
          <option value="custom">{t("adminDashboard.filters.customRange")}</option>
        </select>
      </div>

      {range === "custom" && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="from" className="text-xs font-semibold text-ink-500">
              {t("adminDashboard.filters.from")}
            </label>
            <input type="date" id="from" name="from" defaultValue={from} className={controlClassName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="to" className="text-xs font-semibold text-ink-500">
              {t("adminDashboard.filters.to")}
            </label>
            <input type="date" id="to" name="to" defaultValue={to} className={controlClassName} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-xs font-semibold text-ink-500">
          {t("adminDashboard.filters.category")}
        </label>
        <select id="category" name="category" defaultValue={category} className={controlClassName}>
          <option value="">{t("adminDashboard.filters.allCategories")}</option>
          {REGISTRATION_CATEGORIES.map((c) => (
            <option key={c.registrationType} value={c.registrationType}>
              {t(`home.community.roles.${c.roleKey}.title`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-xs font-semibold text-ink-500">
          {t("adminDashboard.filters.status")}
        </label>
        <select id="status" name="status" defaultValue={status} className={controlClassName}>
          <option value="">{t("adminDashboard.filters.allStatuses")}</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {t(`adminDashboard.status.${value}`)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto"
      >
        {t("adminDashboard.filters.apply")}
      </button>
    </form>
  );
}
