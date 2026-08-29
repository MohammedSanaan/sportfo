// A small, shared set of section-header icons for the registration
// experience -- purely decorative (every consumer renders them
// aria-hidden inside SectionCard's icon slot), so a compact hand-drawn
// SVG set is preferable to pulling in an icon library dependency just
// for this. Same stroke-based style already established elsewhere in the
// app (see e.g. LocationPinIcon in ProfileHero.tsx): 20x20 viewBox,
// stroke="currentColor", strokeWidth ~1.4-1.6, no fill.

function iconProps() {
  return {
    "aria-hidden": true as const,
    viewBox: "0 0 20 20",
    fill: "none" as const,
    width: 18,
    height: 18,
  };
}

export function PersonalDetailsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 17c1.2-3.6 4-5.5 6.5-5.5s5.3 1.9 6.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SportsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3v14M3 10h14M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function AchievementIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M6 3h8v4a4 4 0 0 1-8 0V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M4 5H3a2 2 0 0 0 2 2M16 5h1a2 2 0 0 1-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 11v3M7.5 17h5l-.7-2.5h-3.6L7.5 17Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function EmploymentIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="6.5" width="14" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 6.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10.5h14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ApparelIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M7 3.5 4 5.5 3 8l2 1v7.5h10V9l2-1-1-2.5-3-2a3 3 0 0 1-6 0Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfileSetupIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="2.5" y="5.5" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10.7" r="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 5.5 8 3.5h4l1 2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function VerifyIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M10 2.5 16.5 5v5c0 4-2.8 6.8-6.5 8.5C6.3 16.8 3.5 14 3.5 10V5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.2 10.2 9.2 12l3.6-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OrganizationIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="4" y="3" width="8" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8h4v9h-4M6.5 6.5h1M6.5 9.5h1M6.5 12.5h1M9.5 6.5h1M9.5 9.5h1M9.5 12.5h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function LocationIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function DocumentsIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M6 2.5h5.5L15 6v11.5H6V2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.3 2.5V6H15M8 10h4M8 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ExperienceIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10.5" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 2.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function PortfolioIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="4" width="14" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.3" cy="8.3" r="1.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 14.5 8 10.5l2.5 2.5L14 9.5l2.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AvailabilityIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="4" width="14" height="12.5" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.5 11.5h1.2M9.4 11.5h1.2M12.3 11.5h1.2M6.5 14h1.2M9.4 14h1.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BudgetIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v8M12.3 7.8c0-.9-1-1.6-2.3-1.6s-2.3.8-2.3 1.7c0 2.4 4.6 1.1 4.6 3.4 0 1-1 1.7-2.3 1.7s-2.3-.7-2.3-1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ToolsIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M12.8 3.3a3.3 3.3 0 0 0-4.4 4l-6 6 2.3 2.3 6-6a3.3 3.3 0 0 0 4-4.4l-2.1 2.1-1.9-.5-.5-1.9 2.1-2.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpecializationIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function SubmissionIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.8 10.2 9 12.4l4.2-4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TipsIcon() {
  return (
    <svg {...iconProps()}>
      <path
        d="M10 2.5a4.7 4.7 0 0 0-2.7 8.5c.5.4.7.9.7 1.5v.5h4v-.5c0-.6.2-1.1.7-1.5A4.7 4.7 0 0 0 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 16h4M8.7 17.5h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SupportIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 5l2.8 2.8M15 5l-2.8 2.8M5 15l2.8-2.8M15 15l-2.8-2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// A larger version used on success screens, distinct sizing from the
// SectionCard-badge icons above.
export function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5 10.8 15 16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
