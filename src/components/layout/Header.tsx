"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface HeaderProps {
  // Server-rendered Sign In / Join / Logout state, composed in from
  // RootLayout (a Server Component) since this component needs
  // usePathname()/scroll state and can't import the async AuthNav Server
  // Component directly once it's a Client Component itself.
  authNav: ReactNode;
}

const MARKETING_LINKS = [
  { href: "/#athletes", label: "Athletes" },
  { href: "/#opportunities", label: "Opportunities" },
  { href: "/#events", label: "Events" },
  { href: "/#creators", label: "Creators" },
  { href: "/#academies", label: "Academies" },
  { href: "/#sponsors", label: "Sponsors" },
];

const navLinkBase = "rounded-md px-3 py-2 text-sm font-medium transition-colors";

export function Header({ authNav }: HeaderProps) {
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

        {isHome && (
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
            className="sf-authnav flex items-center gap-1"
          >
            {authNav}
          </nav>
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
