"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { MobileMenuToggle } from "./MobileMenuToggle";

interface HeaderProps {
  // Server-rendered Sign In / Join / Logout state, composed in from
  // RootLayout (a Server Component) since this component needs
  // usePathname()/scroll state and can't import the async AuthNav Server
  // Component directly once it's a Client Component itself.
  authNav: ReactNode;
  // A second, independent instance of the same content for the mobile
  // panel -- kept separate from `authNav` rather than rendering that same
  // element in two places at once, which isn't a safe pattern for a
  // Suspense-wrapped Server Component boundary.
  mobileAuthNav: ReactNode;
  // Below `sm`, authNav is hidden (see .sf-authnav below) and its full
  // content only lives inside the hamburger panel -- which left a
  // signed-out visitor with literally no visible way to sign in until they
  // opened the menu. A signed-in user's full nav (View Profile/Register/
  // Logout) is too much to also duplicate at this width, but a single
  // compact "Login" link isn't, so that one link stays visible outside the
  // menu specifically for a signed-out visitor.
  isAuthenticated: boolean;
}

// The one link every page should offer to real discovery, not just the
// homepage's own on-page anchor. Homepage keeps its existing MARKETING_LINKS
// unchanged below; this is additive, sitewide navigation main already had.
const DISCOVER_LINK = { href: "/athletes", label: "Discover Athletes" };

const MARKETING_LINKS = [
  { href: "/#athletes", label: "Athletes" },
  { href: "/#opportunities", label: "Opportunities" },
  { href: "/#events", label: "Events" },
  { href: "/#creators", label: "Creators" },
  { href: "/#academies", label: "Academies" },
  { href: "/#sponsors", label: "Sponsors" },
];

const navLinkBase = "rounded-md px-3 py-2 text-sm font-medium transition-colors";

export function Header({ authNav, mobileAuthNav, isAuthenticated }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage the header floats over the dark hero until the page
  // scrolls, so the arena reads full-bleed. Everywhere else — and as soon as
  // anything scrolls under it — it is the normal light bar.
  const overHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        overHero
          ? "border-transparent bg-transparent"
          : "border-border-default bg-surface/85 shadow-[0_1px_0_rgba(10,22,40,0.04)] backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[78rem] items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-[-0.02em] transition-colors",
            overHero ? "text-white" : "text-ink-900",
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition-colors",
              overHero ? "bg-white text-navy-950" : "bg-brand-600 text-white",
            )}
          >
            SF
          </span>
          SportFo
        </Link>

        {isHome ? (
          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {MARKETING_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  navLinkBase,
                  overHero
                    ? "text-steel-300 hover:bg-white/10 hover:text-white"
                    : "text-ink-600 hover:bg-surface-muted hover:text-ink-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <nav aria-label="Primary" className="hidden items-center gap-0.5 sm:flex">
            <Link
              href={DISCOVER_LINK.href}
              className={cn(navLinkBase, "text-ink-600 hover:bg-surface-muted hover:text-ink-900")}
            >
              {DISCOVER_LINK.label}
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-1">
          {isHome && (
            <div className="hidden items-center sm:flex">
              {searchOpen ? (
                <input
                  autoFocus
                  type="search"
                  placeholder="Search athletes, academies, events..."
                  onBlur={() => setSearchOpen(false)}
                  className={cn(
                    "h-9 w-56 rounded-full border px-4 text-sm focus:outline-none",
                    overHero
                      ? "border-white/25 bg-white/10 text-white placeholder:text-steel-400 focus:border-white/50"
                      : "border-border-strong bg-surface text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
                  )}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search SportFo"
                  className={cn(
                    navLinkBase,
                    "flex h-9 w-9 items-center justify-center px-0",
                    overHero
                      ? "text-steel-300 hover:bg-white/10 hover:text-white"
                      : "text-ink-600 hover:bg-surface-muted hover:text-ink-900",
                  )}
                >
                  <SearchIcon />
                </button>
              )}
            </div>
          )}

          {/* AuthNav is composed in from the layout as a Server Component, so
              its colours can't be passed down as props. The over-hero
              treatment is applied by scoped CSS keyed off this attribute
              (see globals.css) rather than by rewriting the auth surface. */}
          <nav
            aria-label={isHome ? "Account" : "Primary"}
            data-over-hero={overHero}
            className="sf-authnav hidden items-center gap-1 sm:flex"
          >
            {authNav}
          </nav>

          {!isAuthenticated && (
            <Link
              href="/auth"
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-full border px-3.5 text-sm font-medium transition-colors sm:hidden",
                overHero
                  ? "border-white/30 text-steel-300 hover:border-white/50 hover:bg-white/10 hover:text-white"
                  : "border-border-strong text-ink-700 hover:border-ink-400 hover:bg-surface-muted hover:text-ink-900",
              )}
            >
              Login
            </Link>
          )}

          <MobileMenuToggle
            triggerClassName={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200",
              overHero
                ? "text-white hover:bg-white/10"
                : "text-ink-700 hover:bg-surface-muted",
            )}
          >
            <Link
              href={DISCOVER_LINK.href}
              className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-ink-700 hover:bg-surface-muted"
            >
              {DISCOVER_LINK.label}
            </Link>
            {mobileAuthNav}
          </MobileMenuToggle>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
