import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

interface AccessDeniedProps {
  locale: Locale;
}

// Reached by any authenticated-but-non-admin visitor to /admin/dashboard.
// A clear, honest denial rather than a spoofed 404 -- the route existing
// isn't sensitive, only its data is, and that data is never rendered here
// (this component receives nothing from the database at all).
export function AccessDenied({ locale }: AccessDeniedProps) {
  const t = (key: string) => translate(locale, key);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">{t("adminDashboard.accessDenied.title")}</h1>
      <p className="max-w-md text-base text-ink-500">{t("adminDashboard.accessDenied.description")}</p>
      <Link href="/" className="mt-3">
        <Button type="button" variant="primary">
          {t("adminDashboard.accessDenied.action")}
        </Button>
      </Link>
    </div>
  );
}
