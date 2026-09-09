"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCloseMobileMenu } from "./MobileMenuToggle";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// The guest header's "Join SportFo" CTA: the Community/"Who We Serve"
// section is the real registration gateway (pick a category there, which
// routes to /register/{category}), never a shortcut straight to /auth and
// never an assumed Athlete. Same same-page-scroll / cross-page-navigate
// split as HeaderNav's useSectionNavigate, just generalized for a single
// target id used outside that component's own nav-item list.
export function JoinCommunityLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const href = pathname === "/" ? "#community" : "/#community";
  // No-op outside the mobile hamburger panel (default context value) --
  // safe to call unconditionally here even for this link's other, non-menu
  // usages (desktop header, AlreadyRegisteredNotice).
  const closeMenu = useCloseMobileMenu();

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        closeMenu();
        if (pathname !== "/") return;
        const el = document.getElementById("community");
        if (!el) return;
        event.preventDefault();
        el.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
        history.replaceState(null, "", "#community");
      }}
    >
      {children}
    </Link>
  );
}
