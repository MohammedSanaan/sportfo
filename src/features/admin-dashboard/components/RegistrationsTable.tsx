import Link from "next/link";
import { cn } from "@/lib/cn";
import { getRegistrationCategoryByType } from "@/lib/registration/categories";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

export interface AdminRegistrationRow {
  id: string;
  sportfo_id: string | null;
  display_name: string | null;
  registration_type: string;
  status: string;
  registered_at: string | null;
}

interface RegistrationsTableProps {
  rows: AdminRegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
  locale: Locale;
  buildPageHref: (page: number) => string;
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  draft: "bg-surface-muted text-ink-600",
  submitted: "bg-brand-50 text-brand-700",
  verified: "bg-success-50 text-success-500",
  rejected: "bg-red-50 text-red-700",
};

// Deliberately narrow: SportFo ID, display name, category, date, status.
// Never phone, private email, or document paths -- those live only on the
// role-specific profile tables, which this table's data source
// (admin_list_registrations) never selects from.
export function RegistrationsTable({
  rows,
  total,
  page,
  pageSize,
  locale,
  buildPageHref,
}: RegistrationsTableProps) {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-2xl border border-border-default bg-surface shadow-sm">
      <div className="border-b border-border-default p-5">
        <h3 className="text-sm font-semibold text-ink-900">{t("adminDashboard.table.title")}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border-default text-xs font-semibold tracking-wide text-ink-400 uppercase">
              <th className="px-5 py-3">{t("adminDashboard.table.sportfoId")}</th>
              <th className="px-5 py-3">{t("adminDashboard.table.name")}</th>
              <th className="px-5 py-3">{t("adminDashboard.table.category")}</th>
              <th className="px-5 py-3">{t("adminDashboard.table.registeredDate")}</th>
              <th className="px-5 py-3">{t("adminDashboard.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-ink-400">
                  {t("adminDashboard.table.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const categoryConfig = getRegistrationCategoryByType(row.registration_type);
                const categoryLabel = categoryConfig
                  ? t(`home.community.roles.${categoryConfig.roleKey}.title`)
                  : row.registration_type;
                return (
                  <tr key={row.id} className="border-b border-border-default last:border-0">
                    <td className="px-5 py-3 font-medium text-ink-900">{row.sportfo_id ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-700">{row.display_name || "—"}</td>
                    <td className="px-5 py-3 text-ink-700">{categoryLabel}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-ink-700">
                      {row.registered_at
                        ? new Date(row.registered_at).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          STATUS_BADGE_CLASSES[row.status] ?? "bg-surface-muted text-ink-600",
                        )}
                      >
                        {t(`adminDashboard.status.${row.status}`)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">
          {t("adminDashboard.table.pageInfo", { page, totalPages, total })}
        </p>
        <div className="flex gap-2">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg border border-border-strong px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted",
              page <= 1 && "pointer-events-none opacity-40",
            )}
          >
            {t("adminDashboard.table.previous")}
          </Link>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-lg border border-border-strong px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted",
              page >= totalPages && "pointer-events-none opacity-40",
            )}
          >
            {t("adminDashboard.table.next")}
          </Link>
        </div>
      </div>
    </div>
  );
}
