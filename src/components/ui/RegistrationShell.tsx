import type { ReactNode } from "react";

interface RegistrationShellProps {
  hero: ReactNode;
  children: ReactNode;
}

// The shared page chrome for every registration flow (Athlete and all 7
// generic hub categories): a hero banner full-width on top, then the
// page's own content (category nav + form, or just the form) below it at
// full available width. No right-hand info sidebar -- an earlier version
// of this component had one; it was removed because a 3-column layout
// (category nav + form + info sidebar) squeezed the actual registration
// form too narrow, and every "info sidebar" i18n key lived under a path
// that was never fully populated for every category (the raw
// `registerHub.categories.athlete.sidebar.note.title` key string used to
// leak into the UI as literal text for exactly this reason). Kept as its
// own component (rather than inlining `{hero}{children}` at each call
// site) so all registration pages share one definition of "the page
// shell" and never duplicate this layout.
export function RegistrationShell({ hero, children }: RegistrationShellProps) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {hero}
      {children}
    </div>
  );
}
