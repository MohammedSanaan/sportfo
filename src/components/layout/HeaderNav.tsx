"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCloseMobileMenu } from "./MobileMenuToggle";

export type NavItem = { key: string; href: string; label: string };

function sectionIdFor(item: NavItem): string {
  return item.href.startsWith("#") ? item.href.slice(1) : "home";
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Tracks which homepage section is currently under the header, via
// IntersectionObserver rather than a scroll listener. Only items whose
// target section actually exists in the DOM are observed -- "sports",
// "opportunity", and "contact" have no section yet, so they're silently
// skipped (never become active) instead of erroring, per the "keep future
// items safe/non-breaking" requirement.
function useActiveSection(items: NavItem[]): string | null {
  const pathname = usePathname();
  const [observedActive, setObservedActive] = useState<string | null>("home");

  useEffect(() => {
    if (pathname !== "/") return;

    const elements = items
      .map((item) => document.getElementById(sectionIdFor(item)))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Shrinks the observed viewport to a thin band just below the sticky
    // header, so whichever section's top edge is nearest that band wins --
    // the standard scroll-spy IntersectionObserver recipe.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b,
        );
        setObservedActive(topmost.target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, pathname]);

  // Off the homepage none of these sections exist, so nothing is active --
  // derived directly from pathname rather than written back into state.
  return pathname === "/" ? observedActive : null;
}

// Shared click handling for both desktop and mobile lists: scrolls to the
// section when it exists on the current page, otherwise leaves the Link's
// normal href behavior alone (navigates to "/#id" from another page, or is
// a harmless no-op anchor for not-yet-built sections).
function useSectionNavigate() {
  const pathname = usePathname();

  return (item: NavItem, event: React.MouseEvent) => {
    if (pathname !== "/") return;
    const id = sectionIdFor(item);
    const el = document.getElementById(id);
    if (!el) return;

    event.preventDefault();
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", id === "home" ? "/" : `#${id}`);
  };
}

function hrefFor(item: NavItem, pathname: string | null): string {
  if (item.href === "/" || pathname === "/") return item.href;
  return `/${item.href}`;
}

const desktopBaseClassName =
  "relative flex min-h-11 items-center rounded-md border-b-2 border-b-transparent px-3 text-sm font-medium text-ink-600 transition-colors duration-200 ease-out hover:bg-surface-muted hover:text-ink-900";

// hover:!bg-brand-50 (not hover:bg-brand-50) -- otherwise this loses to the
// base class's hover:bg-surface-muted at equal specificity depending on
// Tailwind's generated rule order, silently making an active-but-hovered
// item look identical to a plain hover (the same class of cascade-order
// bug as the border-color fix earlier this session).
const desktopActiveClassName =
  "header-nav-active border-b-brand-500 bg-brand-50 font-semibold text-ink-900 hover:!bg-brand-50";

export function HeaderNavDesktop({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const active = useActiveSection(items);
  const navigate = useSectionNavigate();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Link
            key={item.key}
            href={hrefFor(item, pathname)}
            onClick={(event) => navigate(item, event)}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? `${desktopBaseClassName} ${desktopActiveClassName}` : desktopBaseClassName}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

const mobileBaseClassName =
  "flex min-h-11 items-center rounded-lg border-l-2 border-l-transparent px-3 text-base font-medium text-ink-700 hover:bg-surface-muted";

const mobileActiveClassName =
  "border-l-brand-500 bg-brand-50 font-semibold text-ink-900 hover:!bg-brand-50";

export function HeaderNavMobile({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const active = useActiveSection(items);
  const navigate = useSectionNavigate();
  const closeMenu = useCloseMobileMenu();

  return (
    <>
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Link
            key={item.key}
            href={hrefFor(item, pathname)}
            onClick={(event) => {
              navigate(item, event);
              closeMenu();
            }}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? `${mobileBaseClassName} ${mobileActiveClassName}` : mobileBaseClassName}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
