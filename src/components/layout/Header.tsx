import Link from "next/link";
import { Suspense } from "react";
import { AuthNav } from "./AuthNav";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { HeaderNavDesktop, HeaderNavMobile, type PlainLink } from "./HeaderNav";
import { LanguageSelector } from "./LanguageSelector";
import { translate } from "@/i18n/dictionary";
import { getAuthUser } from "@/lib/supabase/auth-user";
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

export async function Header({ locale }: { locale: Locale }) {
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    label: translate(locale, `navigation.${item.key}`),
  }));

  // getAuthUser() is React `cache()`-wrapped (see src/lib/supabase/auth-
  // user.ts), so this and AuthNav's own call below resolve to a single
  // deduped Supabase request per page render -- adding this check does not
  // double the auth work Header was already paying for downstream via
  // <AuthNav>, it only moves the (already-cached) boolean up a level so
  // the nav pill row can use it too.
  const user = await getAuthUser();

  // "Discover Athletes" lives on the left with the main nav (not in the
  // right-side auth actions) -- it's a real page, not a homepage scroll
  // section, so it's passed separately as a plain link. "Dashboard" joins
  // it here (also a real route, not a scroll section) but only once
  // authenticated -- a guest opening /dashboard directly is still redirected
  // to /auth by src/proxy.ts regardless of whether this link is shown, so
  // this check is a navigation nicety, never the actual security boundary.
  const plainLinks: PlainLink[] = user
    ? [
        { href: "/dashboard", label: translate(locale, "nav.dashboard") },
        { href: "/athletes", label: translate(locale, "nav.discoverAthletes") },
      ]
    : [{ href: "/athletes", label: translate(locale, "nav.discoverAthletes") }];

  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-white/95 backdrop-blur">
      {/* Full-width bar (no max-w-6xl Container) so the logo/nav hug the
          true left edge and Sign In/Join/Language hug the true right edge
          of the viewport, instead of sitting inside the site's centered
          content column. */}
      <div className="relative flex h-16 w-full items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-ink-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            SF
          </span>
          SportFo
        </Link>

        <HeaderNavDesktop items={navItems} plainLinks={plainLinks} />

        <div className="ml-auto flex items-center gap-1">
          <Suspense fallback={<AuthNavFallback />}>
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              <AuthNav locale={locale} />
            </div>
          </Suspense>
          <LanguageSelector className="hidden lg:flex" />

          <MobileMenuToggle>
            <HeaderNavMobile items={navItems} plainLinks={plainLinks} />
            <div className="mt-3 border-t border-border-default pt-3">
              <Suspense fallback={null}>
                <AuthNav locale={locale} variant="mobile" />
              </Suspense>
            </div>
            {/* Placed inside the panel itself (not next to the hamburger
                trigger) so the always-visible mobile navbar stays uncrowded. */}
            <div className="mt-3 border-t border-border-default pt-3">
              <LanguageSelector />
            </div>
          </MobileMenuToggle>
        </div>
      </div>
    </header>
  );
}
