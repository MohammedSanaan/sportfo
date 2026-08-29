import type { ReactNode } from "react";

interface RegistrationShellProps {
  // Optional -- the /register/[category] hub renders its hero once, above
  // both the category-switcher nav AND this shell, so it passes nothing
  // here and only uses the two-column body below.
  hero?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
}

// The shared page shell for every registration flow (Athlete and all 7
// generic hub categories): hero banner full-width on top, then a premium
// two-column layout below (form content left, contextual info sidebar
// right) that collapses to a single stacked column -- form first, sidebar
// below it -- on anything narrower than the lg breakpoint. No horizontal
// scroll/overflow at any width: the grid's main-content track is a plain
// `1fr`, never a fixed width that could push the sidebar off-screen.
export function RegistrationShell({ hero, children, sidebar }: RegistrationShellProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {hero}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6">{children}</div>
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">{sidebar}</div>
      </div>
    </div>
  );
}
