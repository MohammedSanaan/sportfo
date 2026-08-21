import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { AuthNav } from "./AuthNav";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { LanguageSelector } from "./LanguageSelector";
import { translate } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/config";

function AuthNavFallback() {
  return (
    <span aria-hidden className="flex min-h-11 items-center px-3 text-sm text-transparent">
      Sign In
    </span>
  );
}

const discoverLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-surface-muted hover:text-ink-900";

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-white/95 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            SF
          </span>
          SportFo
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          <Link href="/athletes" className={discoverLinkClassName}>
            {translate(locale, "nav.discoverAthletes")}
          </Link>
          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav locale={locale} />
          </Suspense>
          <LanguageSelector className="ml-1" />
        </nav>

        <MobileMenuToggle>
          <Link
            href="/athletes"
            className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-ink-700 hover:bg-surface-muted"
          >
            {translate(locale, "nav.discoverAthletes")}
          </Link>
          <Suspense fallback={null}>
            <AuthNav locale={locale} />
          </Suspense>
          {/* Placed inside the panel itself (not next to the hamburger
              trigger) so the always-visible mobile navbar stays uncrowded. */}
          <div className="mt-2 border-t border-border-default pt-3">
            <LanguageSelector />
          </div>
        </MobileMenuToggle>
      </Container>
    </header>
  );
}
