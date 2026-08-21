import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

// Deliberately minimal: only real, working destinations. No Privacy/
// Terms/About links (those pages don't exist), and no Creators/Academies/
// Sponsors/Events links here either -- the landing page's "Future
// Ecosystem" section covers that ground as clearly-labeled, non-interactive
// preview tiles, not live footer navigation.
export function Footer({ locale }: { locale: Locale }) {
  const t = (key: string) => translate(locale, key);

  return (
    <footer className="border-t border-border-default bg-navy-950">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 text-base font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              SF
            </span>
            SportFo
          </Link>
          <p className="max-w-xs text-sm text-white/50">{t("footer.tagline")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/40">
            {t("footer.platform")}
          </span>
          <Link href="/athletes" className="text-sm text-white/70 transition-colors hover:text-white">
            {t("footer.discoverAthletes")}
          </Link>
          <Link href="/auth" className="text-sm text-white/70 transition-colors hover:text-white">
            {t("footer.createProfile")}
          </Link>
        </div>
      </Container>

      <Container className="border-t border-white/10 py-6">
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} {t("footer.copyright")}
        </p>
      </Container>
    </footer>
  );
}
