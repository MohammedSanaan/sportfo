import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { AuthNav } from "./AuthNav";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { HeaderNavDesktop, HeaderNavMobile } from "./HeaderNav";
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

// Section-anchor navigation for the homepage. "home" scrolls to the hero
// (id="home") while on "/", or goes to "/" from any other page. "about"
// and "community" are real, existing section ids. "sports", "opportunity",
// and "contact" don't have a matching section yet, so they're left as
// prepared (currently inert) anchors rather than fake pages -- HeaderNav's
// scroll-spy simply never observes them until a matching id exists.
const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "#about" },
  { key: "community", href: "#community" },
  { key: "sports", href: "#sports" },
  { key: "opportunity", href: "#opportunity" },
  { key: "stories", href: "#stories" },
  { key: "contact", href: "#contact" },
] as const;

export function Header({ locale }: { locale: Locale }) {
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: translate(locale, `navigation.${item.key}`),
  }));

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

        <HeaderNavDesktop items={navItems} />

        <div className="flex items-center gap-1">
          <Suspense fallback={<AuthNavFallback />}>
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              <AuthNav locale={locale} />
            </div>
          </Suspense>
          <LanguageSelector className="hidden lg:flex" />

          <MobileMenuToggle>
            <HeaderNavMobile items={navItems} />
            <div className="mt-2 border-t border-border-default pt-3">
              <Suspense fallback={null}>
                <AuthNav locale={locale} variant="mobile" />
              </Suspense>
            </div>
            {/* Placed inside the panel itself (not next to the hamburger
                trigger) so the always-visible mobile navbar stays uncrowded. */}
            <div className="mt-2 border-t border-border-default pt-3">
              <LanguageSelector />
            </div>
          </MobileMenuToggle>
        </div>
      </Container>
    </header>
  );
}
