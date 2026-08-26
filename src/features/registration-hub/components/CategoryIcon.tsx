import type { ReactNode } from "react";
import type { RegistrationCategoryId } from "@/lib/registration/categories";

interface CategoryIconProps {
  category: RegistrationCategoryId;
  className?: string;
}

// One inline-SVG line icon per registration category -- deliberately not a
// new icon-library dependency (the project has none; see SportCombobox.tsx
// for the same pattern). currentColor throughout so callers tint via a text
// color class.
const ICON_PATHS: Record<RegistrationCategoryId, ReactNode> = {
  // Athlete -- medal
  athlete: (
    <>
      <circle cx="12" cy="15" r="5" />
      <path d="M9 10.5 6 3h3l3 6.5 3-6.5h3l-3 7.5" strokeLinejoin="round" />
      <path d="M10.3 13.3 12 15l1.7-1.7" strokeLinejoin="round" />
    </>
  ),
  // Academy / Coach / Parent -- users
  academyCoachParent: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" strokeLinecap="round" />
      <circle cx="17.5" cy="9.5" r="2.5" />
      <path d="M15 20a4.5 4.5 0 0 1 6.5-4" strokeLinecap="round" />
    </>
  ),
  // Performance Expert -- heart pulse
  performanceExpert: (
    <>
      <path
        d="M12 20.2 4.9 13.4a4.6 4.6 0 0 1 6.5-6.5l.6.6.6-.6a4.6 4.6 0 0 1 6.5 6.5L12 20.2Z"
        strokeLinejoin="round"
      />
      <path d="M6.5 12h2.2l1.3-2.5 1.6 4 1.3-2.5h3.1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Media & Creator -- camera
  mediaCreator: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8 7 9.6 4.5h4.8L16 7" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  // Sports Management & Legal -- briefcase
  managementLegal: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  // Event & Operations -- calendar
  eventOperations: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" strokeLinecap="round" />
      <path d="M8 13.5h2.5M8 17h2.5M13.5 13.5H16M13.5 17H16" strokeLinecap="round" />
    </>
  ),
  // Sponsors & CSR -- handshake
  sponsorCsr: (
    <>
      <path d="M3 11.5 7 8l3.2 2.6a1.8 1.8 0 0 1 0 2.8l-.2.2a1.8 1.8 0 0 1-2.5 0L6 12" strokeLinejoin="round" />
      <path d="M21 11.5 17 8l-3.2 2.6a1.8 1.8 0 0 0 0 2.8l3.7 3.4a1.8 1.8 0 0 0 2.6-.1l.9-1" strokeLinejoin="round" />
      <path d="M9.5 15 11 16.4a1.8 1.8 0 0 0 2.6-.1" strokeLinejoin="round" />
    </>
  ),
  // Talent Discovery & Analytics -- search + chart
  talentAnalytics: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15 20.5 20.5" strokeLinecap="round" />
      <path d="M7.5 12v-2M10.5 12V8.5M13.5 12v-3.5" strokeLinecap="round" />
    </>
  ),
};

export function CategoryIcon({ category, className }: CategoryIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[category]}
    </svg>
  );
}
