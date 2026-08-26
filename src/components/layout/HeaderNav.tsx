"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useCloseMobileMenu } from "./MobileMenuToggle";

export type NavItem = { key: string; href: string; label: string };

// A plain page link (e.g. "Discover Athletes" -> /athletes) rendered
// alongside the scroll-spy items, but navigated normally instead of being
// tied into the homepage's section scrolling.
export type PlainLink = { href: string; label: string };

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
  "relative flex min-h-11 items-center overflow-hidden rounded-md border-b-2 border-b-transparent px-3 text-sm font-medium";

// hover:!bg-brand-50 (not hover:bg-brand-50) -- otherwise this loses to the
// base class's hover:bg-surface-muted at equal specificity depending on
// Tailwind's generated rule order, silently making an active-but-hovered
// item look identical to a plain hover (the same class of cascade-order
// bug as the border-color fix earlier this session).
const desktopActiveClassName =
  "header-nav-active border-b-brand-500 bg-brand-50 font-semibold hover:!bg-brand-50";

// Pill-style hover: a circle grows out of the bottom of the pill while
// the label crossfades into a white copy of itself, instead of the flat
// background/text-color swap this nav used before. Sizing math (R/D/delta)
// keeps the circle always just covering the pill regardless of its
// (variable, translated) label width.
function usePillHoverEffect(count: number, ease = "power3.easeOut") {
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const hoverLabel = pill.querySelector<HTMLElement>(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hoverLabel, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready?.then(layout).catch(() => {});
    return () => window.removeEventListener("resize", layout);
  }, [count, ease]);

  // Handed to PillLink instead of the raw ref object -- a child mutating
  // `.current` on a ref it received via props is exactly what the
  // react-hooks/immutability rule (React Compiler's stricter lint set)
  // flags as unsafe, even though this specific pattern is safe. Routing the
  // write through a callback that closes over the ref keeps the mutation on
  // the side that actually owns it.
  const setCircleRef = useCallback((index: number, el: HTMLSpanElement | null) => {
    circleRefs.current[index] = el;
  }, []);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };

  return { setCircleRef, handleEnter, handleLeave };
}

// Shared pill markup (circle + crossfading label) for both the scroll-spy
// items and the plain page links, so "Discover Athletes" gets the exact
// same hover animation as Home/About/Community/etc.
function PillLink({
  href,
  label,
  isActive,
  index,
  setCircleRef,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  index: number;
  setCircleRef: (index: number, el: HTMLSpanElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: (event: React.MouseEvent) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-current={isActive ? "page" : undefined}
      className={isActive ? `${desktopBaseClassName} ${desktopActiveClassName}` : desktopBaseClassName}
    >
      <span
        aria-hidden="true"
        ref={(el) => setCircleRef(index, el)}
        className="pointer-events-none absolute left-1/2 bottom-0 rounded-full bg-brand-500"
      />
      <span className="relative inline-block leading-none">
        <span
          className={`pill-label relative z-10 inline-block leading-none ${
            isActive ? "text-ink-900" : "text-ink-600"
          }`}
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          className="pill-label-hover absolute top-0 left-0 z-10 inline-block leading-none text-white"
        >
          {label}
        </span>
      </span>
    </Link>
  );
}

export function HeaderNavDesktop({
  items,
  plainLinks = [],
}: {
  items: NavItem[];
  plainLinks?: PlainLink[];
}) {
  const pathname = usePathname();
  const active = useActiveSection(items);
  const navigate = useSectionNavigate();
  const { setCircleRef, handleEnter, handleLeave } = usePillHoverEffect(items.length + plainLinks.length);

  return (
    <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
      {items.map((item, i) => (
        <PillLink
          key={item.key}
          href={hrefFor(item, pathname)}
          label={item.label}
          isActive={active === item.key}
          index={i}
          setCircleRef={setCircleRef}
          onMouseEnter={() => handleEnter(i)}
          onMouseLeave={() => handleLeave(i)}
          onClick={(event) => navigate(item, event)}
        />
      ))}
      {plainLinks.map((link, j) => {
        const index = items.length + j;
        return (
          <PillLink
            key={link.href}
            href={link.href}
            label={link.label}
            isActive={pathname === link.href}
            index={index}
            setCircleRef={setCircleRef}
            onMouseEnter={() => handleEnter(index)}
            onMouseLeave={() => handleLeave(index)}
          />
        );
      })}
    </nav>
  );
}

const mobileBaseClassName =
  "flex min-h-11 items-center rounded-lg border-l-2 border-l-transparent px-3 text-base font-medium text-ink-700 hover:bg-surface-muted";

const mobileActiveClassName =
  "border-l-brand-500 bg-brand-50 font-semibold text-ink-900 hover:!bg-brand-50";

export function HeaderNavMobile({
  items,
  plainLinks = [],
}: {
  items: NavItem[];
  plainLinks?: PlainLink[];
}) {
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
      {plainLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? `${mobileBaseClassName} ${mobileActiveClassName}` : mobileBaseClassName}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
